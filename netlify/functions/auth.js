const crypto = require('crypto');

function siteUrl() {
  return (process.env.URL || 'https://astonemwambaportfolio.netlify.app').replace(/\/$/, '');
}

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body:
        'Missing GITHUB_CLIENT_ID. Add it in Netlify → Site configuration → Environment variables.',
    };
  }

  const scope = (event.queryStringParameters && event.queryStringParameters.scope) || 'repo';
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${siteUrl()}/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scope);
  authorizeUrl.searchParams.set('state', state);

  return {
    statusCode: 302,
    headers: {
      Location: authorizeUrl.toString(),
      'Cache-Control': 'no-store',
      'Set-Cookie': `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
    body: '',
  };
};
