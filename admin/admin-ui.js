/**
 * Appearance-only enhancements for Decap CMS.
 * Does not change auth, Git Gateway, or content publishing.
 */
(function () {
  function isDashboardRoute() {
    var hash = window.location.hash || '#/';
    // Decap home / collections overview
    return hash === '#/' || hash === '#' || /^#\/?\s*$/.test(hash);
  }

  function ensureBanner() {
    var existing = document.querySelector('.am-dashboard-banner');
    if (!isDashboardRoute()) {
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
      '<p>Manage blog posts and achievements for your portfolio. Choose a collection below, edit, then publish — changes go to GitHub and Netlify rebuilds the site.</p>' +
      '<div class="am-meta">' +
      '<span class="am-chip">Blog</span>' +
      '<span class="am-chip">Achievements</span>' +
      '<span class="am-chip">Media uploads</span>' +
      '</div>';

    if (host.firstChild) {
      host.insertBefore(banner, host.firstChild);
    } else {
      host.appendChild(banner);
    }
  }

  function boot() {
    ensureBanner();
    // Decap is a SPA — keep banner in sync with hash routes
    window.addEventListener('hashchange', ensureBanner);
    var root = document.getElementById('nc-root') || document.body;
    var observer = new MutationObserver(function () {
      ensureBanner();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Soften preview pane to match site type once CMS is ready
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
