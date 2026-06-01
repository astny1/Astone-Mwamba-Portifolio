/**
 * Netlify Identity — invite tokens must NOT be handled on /admin/
 * (Decap CMS uses #/ routes and breaks #invite_token=).
 */
(function () {
    function getInviteToken() {
        var hash = window.location.hash || '';
        var match = hash.match(/invite_token=([^&]+)/);
        if (match) return match[1];
        var params = new URLSearchParams(window.location.search);
        return params.get('invite_token');
    }

    function isInvitePage() {
        return /\/invite\.html$/i.test(window.location.pathname);
    }

    function isAdminPage() {
        return /\/admin\/?$/i.test(window.location.pathname) ||
            /\/admin\/index\.html$/i.test(window.location.pathname);
    }

    var token = getInviteToken();
    if (!token) return;

    // Always accept invites on /invite.html (not /admin/)
    if (!isInvitePage()) {
        window.location.replace('/invite.html#invite_token=' + encodeURIComponent(token));
        return;
    }

    // On invite page: normalize hash for Netlify (no leading slash)
    if (isInvitePage() && window.netlifyIdentity) {
        window.location.hash = 'invite_token=' + token;
        window.netlifyIdentity.on('init', function (user) {
            if (!user) {
                window.netlifyIdentity.open('signup');
            }
        });
    }
})();
