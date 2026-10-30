/**
 * Appearance-only enhancements for Decap CMS.
 * Does not change auth, Git Gateway, or content publishing.
 */
(function () {
  function isDashboardRoute() {
    var hash = window.location.hash || '#/';
    return hash === '#/' || hash === '#' || /^#\/?\s*$/.test(hash);
  }

  function isCommentsRoute() {
    return /^#\/comments\/?$/.test(window.location.hash || '');
  }

  function isLoginScreen() {
    return !!document.querySelector('[class*="AuthenticationPage"]');
  }

  function ensureLoginFooter() {
    var existing = document.querySelector('.am-login-footer');
    if (!isLoginScreen()) {
      document.body.classList.add('am-logged-in');
      if (existing) existing.remove();
      return;
    }

    document.body.classList.remove('am-logged-in');
    if (existing) return;

    var footer = document.createElement('footer');
    footer.className = 'am-login-footer';
    footer.innerHTML =
      '<span>© ' +
      new Date().getFullYear() +
      ' Astone Mwamba</span>' +
      '<span class="am-dot">·</span>' +
      '<a href="https://astonemwambaportfolio.netlify.app/" target="_blank" rel="noopener noreferrer">View portfolio</a>' +
      '<span class="am-dot">·</span>' +
      '<span>Content Manager</span>';
    document.body.appendChild(footer);
  }

  function ensureBanner() {
    var existing = document.querySelector('.am-dashboard-banner');
    if (!isDashboardRoute() || isLoginScreen()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    var host =
      document.querySelector('[class*="AppMainContainer"]') ||
      document.querySelector('#nc-root') ||
      document.body;

    var banner = document.createElement('div');
    banner.className = 'am-dashboard-banner';
    banner.innerHTML =
      '<h1>Content <span>Dashboard</span></h1>' +
      '<p>Manage blog posts, achievements, leadership events, and impact videos. Blog comments stay in the panel on the right.</p>' +
      '<div class="am-meta">' +
      '<span class="am-chip">Blog</span>' +
      '<a class="am-chip am-comments-chip" href="#/comments">Comments</a>' +
      '<span class="am-chip">Achievements</span>' +
      '<span class="am-chip">Events</span>' +
      '<span class="am-chip">Impact</span>' +
      '<span class="am-chip">Media uploads</span>' +
      '</div>';

    if (host.firstChild) {
      host.insertBefore(banner, host.firstChild);
    } else {
      host.appendChild(banner);
    }
  }

  function escapeText(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function adminToken() {
    var identity = window.netlifyIdentity;
    var user = identity && identity.currentUser && identity.currentUser();
    if (!user || !user.jwt) return Promise.resolve('');
    return user.jwt().catch(function () { return ''; });
  }

  function renderCommentRows(panel, comments) {
    var list = panel.querySelector('.am-comment-rows');
    var note = panel.querySelector('.am-comment-note');
    if (!comments.length) {
      list.innerHTML = '<p class="am-comment-empty">No comments yet.</p>';
      if (note) note.textContent = '';
      return;
    }
    list.innerHTML = comments.map(function (comment) {
      return '<article class="am-comment-row">' +
        '<div><strong>' + escapeText(comment.name) + '</strong>' +
        '<span>' + escapeText(comment.date) + ' · ' + escapeText(comment.slug) + '</span>' +
        '<p>' + escapeText(comment.message) + '</p></div>' +
        '<button type="button" data-id="' + escapeText(comment.id) + '">Delete</button>' +
        '</article>';
    }).join('');
  }

  function loadAdminComments(panel) {
    var note = panel.querySelector('.am-comment-note');
    fetch('/.netlify/functions/comment')
      .then(function (response) { return response.json(); })
      .then(function (data) {
        var comments = data.comments || [];
        renderCommentRows(panel, comments);
        var chip = document.querySelector('.am-comments-chip');
        if (chip) chip.textContent = comments.length ? 'Comments (' + comments.length + ')' : 'Comments';
      })
      .catch(function () {
        if (note) note.textContent = 'Could not load comments.';
      });
  }

  function isLoggedIn() {
    if (isLoginScreen()) return false;
    var root = document.getElementById('nc-root');
    return !!(root && root.textContent && root.textContent.trim().length > 20);
  }

  function ensureComments() {
    var existing = document.querySelector('.am-comment-panel');
    if (!isLoggedIn()) {
      if (existing) existing.remove();
      return;
    }
    if (existing) return;

    var panel = document.createElement('aside');
    panel.className = 'am-comment-panel is-dock';
    panel.innerHTML =
      '<h2>Blog comments</h2>' +
      '<p class="am-comment-note"></p>' +
      '<div class="am-comment-rows"><p class="am-comment-empty">Loading comments…</p></div>';
    panel.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-id]');
      if (!button) return;
      var note = panel.querySelector('.am-comment-note');
      button.disabled = true;
      adminToken().then(function (token) {
        if (!token) throw new Error('Log in again to delete a comment.');
        return fetch('/.netlify/functions/comment', {
          method: 'DELETE',
          headers: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: button.getAttribute('data-id') })
        });
      }).then(function (response) {
        return response.json().then(function (data) {
          if (!response.ok) throw new Error(data.error || 'Could not delete the comment.');
          loadAdminComments(panel);
        });
      }).catch(function (error) {
        button.disabled = false;
        if (note) note.textContent = error.message || 'Could not delete the comment.';
      });
    });

    document.body.appendChild(panel);
    loadAdminComments(panel);
  }

  function refreshUi() {
    ensureLoginFooter();
    ensureBanner();
    ensureComments();
  }

  function boot() {
    refreshUi();
    window.addEventListener('hashchange', refreshUi);
    var root = document.getElementById('nc-root') || document.body;
    var observer = new MutationObserver(refreshUi);
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  if (window.CMS) {
    try {
      window.CMS.registerPreviewStyle(
        'body{font-family:Poppins,system-ui,sans-serif;background:#031a30;color:#dce5fb;padding:1.25rem;}h1,h2,h3{font-family:"Advent Pro",sans-serif;color:#dce5fb;}a{color:hsl(185,100%,50%);}',
        { raw: true }
      );
    } catch (e) {
      /* CMS may still be loading widgets */
    }
  }
})();
