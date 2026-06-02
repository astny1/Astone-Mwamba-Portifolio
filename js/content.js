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

function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function achievementSlug(item) {
    return item.slug || slugify(item.title);
}

function truncateText(text, maxLen) {
    if (!text) return '';
    if (text.length <= maxLen) return text;
    const cut = text.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

function achievementExcerpt(item) {
    if (item.excerpt && item.excerpt.trim()) return item.excerpt.trim();
    return truncateText(item.description, 110);
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
            const slug = achievementSlug(item);
            const cover = item.image
                ? `<div class="achievement-story-cover">
                    <img src="${escapeHtml(imgSrc(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">
                   </div>`
                : `<div class="achievement-story-cover achievement-story-cover--empty" aria-hidden="true"></div>`;

            return `
            <article class="achievement-story-card">
                ${cover}
                <div class="achievement-story-body">
                    <div class="achievement-story-meta">
                        <span class="content-tag">${escapeHtml(item.category)}</span>
                        <span class="content-date">${escapeHtml(item.year)}</span>
                    </div>
                    <h2 class="achievement-story-title">${escapeHtml(item.title)}</h2>
                    <p class="achievement-story-excerpt">${escapeHtml(achievementExcerpt(item))}</p>
                    <a href="achievement-post.html?slug=${encodeURIComponent(slug)}" class="read-more">Read more <i class="uil uil-arrow-right"></i></a>
                </div>
            </article>`;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Could not load achievements.</p>';
    }
}

async function loadAchievementDetail(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = 'achievements.html';
        return;
    }

    try {
        const res = await fetch('data/achievements.json');
        const data = await res.json();
        const item = (data.achievements || []).find(a => achievementSlug(a) === slug);

        if (!item) {
            container.innerHTML = '<p class="empty-msg">Achievement not found. <a href="achievements.html">Back to achievements</a></p>';
            return;
        }

        document.title = `${item.title} | Astone Mwamba`;

        const photo = item.image
            ? `<figure class="achievement-detail-hero is-zoomable" role="button" tabindex="0" aria-label="View full size photo">
                <img src="${escapeHtml(imgSrc(item.image))}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async">
                <span class="achievement-detail-zoom-hint"><i class="uil uil-expand-arrows-alt"></i> Click to view full size</span>
               </figure>`
            : '';

        container.innerHTML = `
            <a href="achievements.html" class="back-link"><i class="uil uil-arrow-left"></i> Back to Achievements</a>
            <div class="achievement-detail-meta">
                <span class="content-tag">${escapeHtml(item.category)}</span>
                <span class="content-date">${escapeHtml(item.year)}</span>
            </div>
            <h1 class="post-title achievement-detail-title">${escapeHtml(item.title)}</h1>
            ${photo}
            <div class="achievement-detail-body">
                <p>${escapeHtml(item.description)}</p>
            </div>
        `;

        initAchievementImageLightbox(container);
    } catch (e) {
        container.innerHTML = '<p class="empty-msg">Could not load achievement.</p>';
    }
}

function getAchievementLightbox() {
    let lightbox = document.getElementById('achievement-lightbox');
    if (lightbox) return lightbox;

    lightbox = document.createElement('div');
    lightbox.id = 'achievement-lightbox';
    lightbox.className = 'achievement-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Full size photo');
    lightbox.innerHTML = `
        <button type="button" class="achievement-lightbox-close" aria-label="Close full photo">&times;</button>
        <div class="achievement-lightbox-backdrop"></div>
        <figure class="achievement-lightbox-frame">
            <img src="" alt="">
        </figure>
    `;
    document.body.appendChild(lightbox);

    const closeLightbox = () => {
        lightbox.classList.remove('is-open');
        document.body.classList.remove('achievement-lightbox-open');
        lightbox.querySelector('img').removeAttribute('src');
    };

    lightbox.querySelector('.achievement-lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.achievement-lightbox-backdrop').addEventListener('click', closeLightbox);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
            closeLightbox();
        }
    });

    lightbox._close = closeLightbox;
    lightbox._open = (src, alt) => {
        const img = lightbox.querySelector('img');
        img.src = src;
        img.alt = alt || '';
        lightbox.classList.add('is-open');
        document.body.classList.add('achievement-lightbox-open');
        lightbox.querySelector('.achievement-lightbox-close').focus();
    };

    return lightbox;
}

function initAchievementImageLightbox(container) {
    const figure = container.querySelector('.achievement-detail-hero.is-zoomable');
    if (!figure) return;

    const img = figure.querySelector('img');
    if (!img) return;

    const openLightbox = () => {
        getAchievementLightbox()._open(img.src, img.alt);
    };

    figure.addEventListener('click', openLightbox);
    figure.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox();
        }
    });
}
