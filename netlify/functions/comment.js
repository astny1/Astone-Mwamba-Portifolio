const STORE = 'comments';
const KEY = 'list';

function json(status, body) {
  return {
    statusCode: status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function clean(value, max) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function blobContext() {
  const encoded = process.env.NETLIFY_BLOBS_CONTEXT;
  if (!encoded) return null;
  try {
    return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
  } catch (e) {
    return null;
  }
}

async function blobRequest(method, body, etag) {
  const ctx = blobContext();
  if (!ctx || !ctx.siteID || !ctx.token) {
    const error = new Error('Comments storage is unavailable.');
    error.status = 503;
    throw error;
  }

  const headers = { authorization: 'Bearer ' + ctx.token };
  if (etag) headers['if-match'] = etag;
  if (method === 'PUT') headers['content-type'] = 'application/json';

  const edgeBase = ctx.uncachedEdgeURL || ctx.edgeURL;
  if (edgeBase) {
    const url = new URL('/' + ctx.siteID + '/' + STORE + '/' + KEY, edgeBase);
    return fetch(url, { method, headers, body });
  }

  const api = ctx.apiURL || 'https://api.netlify.com';
  const signUrl = new URL('/api/v1/blobs/' + ctx.siteID + '/' + STORE + '/' + KEY, api);
  const signed = await fetch(signUrl, {
    method,
    headers: {
      authorization: headers.authorization,
      accept: 'application/json;type=signed-url'
    }
  });
  if (!signed.ok) return signed;
  const target = await signed.json();
  const finalHeaders = {};
  if (method === 'PUT') finalHeaders['content-type'] = 'application/json';
  if (etag) finalHeaders['if-match'] = etag;
  return fetch(target.url, { method, headers: finalHeaders, body });
}

async function readComments() {
  const response = await blobRequest('GET');
  if (response.status === 404) return { comments: [], etag: '' };
  if (!response.ok) {
    const error = new Error('Could not read comments.');
    error.status = response.status;
    throw error;
  }
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return {
    comments: Array.isArray(data.comments) ? data.comments : [],
    etag: response.headers.get('etag') || ''
  };
}

async function writeComments(comments, etag) {
  const response = await blobRequest('PUT', JSON.stringify({ comments }), etag);
  if (!response.ok && response.status !== 412) {
    const error = new Error('Could not save the comment.');
    error.status = response.status;
    throw error;
  }
  return response.status;
}

async function postExists(slug) {
  const site = process.env.URL || 'https://astonemwambaportfolio.netlify.app';
  const response = await fetch(site + '/data/blog.json');
  if (!response.ok) return true;
  const blog = await response.json();
  return (blog.posts || []).some(post => post.slug === slug);
}

async function isAdmin(event) {
  const header = event.headers.authorization || event.headers.Authorization || '';
  const token = header.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const site = process.env.URL || 'https://astonemwambaportfolio.netlify.app';
  const response = await fetch(site + '/.netlify/identity/user', {
    headers: { Authorization: 'Bearer ' + token }
  });
  return response.ok;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'GET') {
      const { comments } = await readComments();
      return json(200, { comments });
    }

    if (event.httpMethod === 'DELETE') {
      if (!(await isAdmin(event))) {
        return json(401, { error: 'Log in to the admin panel to delete a comment.' });
      }
      const payload = JSON.parse(event.body || '{}');
      const id = clean(payload.id, 40);
      if (!id) return json(400, { error: 'Missing comment.' });

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const current = await readComments();
        const next = current.comments.filter(item => item.id !== id);
        const status = await writeComments(next, current.etag);
        if (status !== 412) return json(200, { ok: true });
      }
      return json(409, { error: 'Could not delete the comment. Try again.' });
    }

    if (event.httpMethod !== 'POST') {
      return json(405, { error: 'Use POST.' });
    }

    const payload = JSON.parse(event.body || '{}');
    if (payload.website) return json(200, { ok: true });

    const slug = clean(payload.slug, 80);
    const name = clean(payload.name, 40);
    const message = clean(payload.message, 500);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || name.length < 2 || message.length < 2) {
      return json(400, { error: 'Add your name and a short comment.' });
    }
    if (!(await postExists(slug))) {
      return json(404, { error: 'That post was not found.' });
    }

    const comment = {
      id: 'c' + Date.now().toString(36),
      slug,
      name,
      message,
      date: new Date().toISOString().slice(0, 10)
    };

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const current = await readComments();
      if (current.comments.filter(item => item.slug === slug).length >= 80) {
        return json(429, { error: 'This post has enough comments for now.' });
      }
      const status = await writeComments(current.comments.concat(comment), current.etag);
      if (status !== 412) return json(200, { ok: true, comment });
    }
    return json(409, { error: 'Could not save the comment. Try again.' });
  } catch (error) {
    return json(error.status === 503 ? 503 : 500, {
      error: error.status === 503
        ? 'Comments are not ready yet.'
        : 'Could not save the comment.'
    });
  }
};
