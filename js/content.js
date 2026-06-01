/* Loads blog & achievements from JSON (edited via /admin CMS or data/*.json) */

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/** Normalize image paths from CMS (handles /images/uploads/... or full URLs) */
function imgSrc(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/')) return path;
    return '/' + path;
}

function renderFeaturedImage(src, alt, className) {
    if (!src) return '';
    return `<figure class="${className}">
        <img src="${escapeHtml(imgSrc(src))}" alt="${escapeHtml(alt || '')}" loading="lazy" decoding="async">
    </figure>`;
}

function renderGallery(images, altPrefix) {
    const list = (images || []).filter(Boolean);
    if (!list.length) return '';

    const items = list.map((item, i) => {
        const src = typeof item === 'string' ? item : item.image;
        if (!src) return '';
        return `<div class="gallery-item">
            <img src="${escapeHtml(imgSrc(src))}" alt="${escapeHtml(altPrefix || 'Photo')} ${i + 1}" loading="lazy" decoding="async">
        </div>`;
    }).join('');

    return `<div class="post-gallery" role="group" aria-label="Photo gallery">${items}</div>`;
}

function renderPostBody(post) {
    if (post.body) {
        if (typeof marked !== 'undefined') {
            return marked.parse(post.body);
        }
        return post.body
            .split(/\n\n+/)
            .map(p => `<p>${escapeHtml(p.trim())}</p>`)
            .join('');
    }
    if (post.content && post.content.length) {
        return post.content.map(p => `<p>${escapeHtml(p)}</p>`).join('');
    }
    return '';
}

async function loadBlogList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch('data/blog.json');
        const data = await res.json();
        const posts = (data.posts || []).sort((a, b) => new Date(b.date) - new Date(a.date));

        if (!posts.length) {
            container.innerHTML = '<p class="empty-msg">No blog posts yet. Add posts at <a href="/admin/">/admin</a> or in <code>data/blog.json</code>.</p>';
            return;
        }

        container.innerHTML = posts.map(post => {
            const thumb = post.featured_image
                ? `<div class="content-card-thumb">
                    <img src="${escapeHtml(imgSrc(post.featured_image))}" alt="" loading="lazy">
                   </div>`
                : '';

            return `
            <article class="content-card content-card-has-media">
                ${thumb}
                <div class="content-card-text">
                    <span class="content-tag">${escapeHtml(post.tag || 'Blog')}</span>
                    <span class="content-date">${formatDate(post.date)}</span>
                    <h2 class="content-card-title"><a href="blog-post.html?slug=${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2>
                    <p class="content-excerpt">${escapeHtml(post.excerpt)}</p>
                    <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="read-more">Read article <i class="uil uil-arrow-right"></i></a>
                </div>
            </article>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Could not load blog posts. Use a local server or deploy to Netlify (see NETLIFY_CMS_SETUP.md).</p>';
    }
}

async function loadBlogPost(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        const res = await fetch('data/blog.json');
        const data = await res.json();
        const post = (data.posts || []).find(p => p.slug === slug);

        if (!post) {
            container.innerHTML = '<p class="empty-msg">Post not found. <a href="blog.html">Back to blog</a></p>';
            return;
        }

        document.title = `${post.title} | Astone Mwamba`;

        const featured = renderFeaturedImage(post.featured_image, post.title, 'post-featured-image');
        const gallery = renderGallery(post.gallery, post.title);

        container.innerHTML = `
            <a href="blog.html" class="back-link"><i class="uil uil-arrow-left"></i> Back to Blog</a>
            <span class="content-tag">${escapeHtml(post.tag || 'Blog')}</span>
            <span class="content-date">${formatDate(post.date)}</span>
            <h1 class="post-title">${escapeHtml(post.title)}</h1>
            ${featured}
            <div class="post-body">${renderPostBody(post)}</div>
            ${gallery}
        `;
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Could not load post.</p>';
    }
}

async function loadAchievements(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const res = await fetch('data/achievements.json');
        const data = await res.json();
        const items = data.achievements || [];

        if (!items.length) {
            container.innerHTML = '<p class="empty-msg">No achievements yet. Add entries at <a href="/admin/">/admin</a> or in <code>data/achievements.json</code>.</p>';
            return;
        }

        container.innerHTML = items.map(item => {
            const photo = item.image
                ? renderFeaturedImage(item.image, item.title, 'achievement-image')
                : '';

            return `
            <article class="content-card achievement-card">
                ${photo}
                <div class="achievement-header">
                    <span class="content-tag">${escapeHtml(item.category)}</span>
                    <span class="content-date">${escapeHtml(item.year)}</span>
                </div>
                <h2 class="content-card-title">${escapeHtml(item.title)}</h2>
                <p class="content-excerpt">${escapeHtml(item.description)}</p>
            </article>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Could not load achievements.</p>';
    }
}
