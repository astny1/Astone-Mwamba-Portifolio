function siteUrl() {
  return (process.env.URL || 'https://astonemwambaportfolio.netlify.app').replace(/\/$/, '');
}

function htmlPage(bodyInner) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CMS Login</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #031a30; color: #dce5fb; display: grid; place-items: center; min-height: 100vh; margin: 0; }
    p { max-width: 28rem; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>${bodyInner}</body>
</html>`;
}

exports.handler = async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const code = event.queryStringParameters && event.queryStringParameters.code;
  const error = event.queryStringParameters && event.queryStringParameters.error;

  if (error) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: htmlPage(`<p>GitHub login was denied or failed (${error}). You can close this window and try again.</p>`),
    };
  }

  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html' },
      body: htmlPage(
        '<p>Missing <code>GITHUB_CLIENT_ID</code> or <code>GITHUB_CLIENT_SECRET</code> in Netlify environment variables.</p>'
      ),
    };
  }

  if (!code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: htmlPage('<p>Missing OAuth code. Close this window and try Login with GitHub again.</p>'),
    };
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${siteUrl()}/callback`,
    }),
  });

  const data = await tokenRes.json();

  if (!data.access_token) {
    const detail = data.error_description || data.error || 'Unknown token error';
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: htmlPage(`<p>Could not complete GitHub login: ${detail}</p>`),
    };
  }

  const message = `authorization:github:success:${JSON.stringify({
    token: data.access_token,
    provider: 'github',
  })}`;

  const script = `
<p>Login successful. This window should close automatically…</p>
<script>
(function () {
  var msg = ${JSON.stringify(message)};
  function receiveMessage(e) {
    window.opener.postMessage(msg, e.origin);
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store',
    },
    body: htmlPage(script),
  };
};
