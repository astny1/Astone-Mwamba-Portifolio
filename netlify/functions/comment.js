const OWNER = process.env.GITHUB_OWNER || 'astny1';
const REPO = process.env.GITHUB_REPO || 'Astone-Mwamba-Portifolio';
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE = 'data/comments.json';

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

async function github(path, options) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const error = new Error('Missing GITHUB_TOKEN');
    error.status = 503;
    throw error;
  }
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'astone-portfolio-comments',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options && options.headers)
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(data.message || 'GitHub request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Use POST.' });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return json(400, { error: 'Invalid comment.' });
  }

  if (payload.website) {
    return json(200, { ok: true });
  }

  const slug = clean(payload.slug, 80);
  const name = clean(payload.name, 40);
  const message = clean(payload.message, 500);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || name.length < 2 || message.length < 2) {
    return json(400, { error: 'Add your name and a short comment.' });
  }

  try {
    const blogFile = await github(`/repos/${OWNER}/${REPO}/contents/data/blog.json?ref=${encodeURIComponent(BRANCH)}`);
    const blog = JSON.parse(Buffer.from(blogFile.content, 'base64').toString('utf8'));
    const postExists = (blog.posts || []).some(post => post.slug === slug);
    if (!postExists) {
      return json(404, { error: 'That post was not found.' });
    }

    let file = null;
    try {
      file = await github(`/repos/${OWNER}/${REPO}/contents/${FILE}?ref=${encodeURIComponent(BRANCH)}`);
    } catch (error) {
      if (error.status !== 404) throw error;
    }
    const current = file
      ? JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'))
      : { comments: [] };
    const comments = Array.isArray(current.comments) ? current.comments : [];
    const onPost = comments.filter(item => item.slug === slug).length;
    if (onPost >= 80) {
      return json(429, { error: 'This post has enough comments for now.' });
    }

    const comment = {
      id: 'c' + Date.now().toString(36),
      slug,
      name,
      message,
      date: new Date().toISOString().slice(0, 10)
    };
    comments.push(comment);

    await github(`/repos/${OWNER}/${REPO}/contents/${FILE}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Add comment on ${slug}`,
        content: Buffer.from(JSON.stringify({ comments }, null, 2) + '\n').toString('base64'),
        ...(file ? { sha: file.sha } : {}),
        branch: BRANCH
      })
    });

    return json(200, { ok: true, comment });
  } catch (error) {
    const status = error.status === 503 ? 503 : 500;
    return json(status, {
      error: status === 503
        ? 'Comments are not ready yet.'
        : 'Could not save the comment.'
    });
  }
};
