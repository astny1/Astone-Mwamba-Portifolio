/**
 * Paste your Google Drive "view" links here (Share → Anyone with the link → Viewer).
 * Portfolio example: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 */
const CV_GOOGLE_DRIVE_URL = 'https://drive.google.com/file/d/1_KZusXtZdGnyrI9ZBmx3jJaMRYweYC1k/view?usp=sharing';

/* Shared navigation — used on all pages */
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.js-cv-link').forEach(function(link) {
        link.href = CV_GOOGLE_DRIVE_URL;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.removeAttribute('download');
    });

    document.querySelectorAll('.js-current-year').forEach(function(el) {
        el.textContent = new Date().getFullYear();
    });
    const header = document.getElementById('header');
    const navBar = document.getElementById('nav-Bar');
    const toggleId = document.getElementById('toggleId');
    const closeIconID = document.getElementById('closeIconID');

    if (toggleId && navBar) {
        toggleId.addEventListener('click', () => navBar.classList.add('show'));
    }
    if (closeIconID && navBar) {
        closeIconID.addEventListener('click', () => navBar.classList.remove('show'));
    }

    document.querySelectorAll('.navLink, .navDropdownLink').forEach(link => {
        link.addEventListener('click', () => {
            if (navBar) navBar.classList.remove('show');
        });
    });

    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('headerActive', window.scrollY > 50);
        });
    }

    // Highlight current page in nav
    const page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navLink, .navDropdownLink').forEach(link => {
        const href = (link.getAttribute('href') || '').split('#')[0].split('/').pop();
        const onLeadership = page.indexOf('leadership') === 0;
        if (href === page || (page === '' && href === 'index.html')) {
            link.style.color = 'var(--primaryColor)';
        } else if (onLeadership && href === 'leadership.html' && link.classList.contains('navLink')) {
            link.style.color = 'var(--primaryColor)';
        }
    });

    const leadershipHero = document.getElementById('leadership-hero');
    const writeup = document.getElementById('leadership-writeup');
    if (leadershipHero) {
        requestAnimationFrame(function() {
            leadershipHero.classList.add('is-loaded');
        });
    }
    if (writeup) {
        const text = writeup.getAttribute('data-writeup') || '';
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion || !text) {
            writeup.textContent = text;
            writeup.classList.add('is-typed');
        } else {
            writeup.textContent = '';
            writeup.classList.add('is-typing');
            let i = 0;
            const typeNext = function() {
                if (i < text.length) {
                    writeup.textContent += text.charAt(i);
                    i += 1;
                    window.setTimeout(typeNext, 28);
                } else {
                    writeup.classList.remove('is-typing');
                    writeup.classList.add('is-typed');
                }
            };
            window.setTimeout(typeNext, 750);
        }
    }

    const photoLightbox = document.createElement('div');
    photoLightbox.className = 'achievement-lightbox';
    photoLightbox.setAttribute('role', 'dialog');
    photoLightbox.setAttribute('aria-modal', 'true');
    photoLightbox.setAttribute('aria-label', 'Full size photo');
    photoLightbox.innerHTML = `
        <button type="button" class="achievement-lightbox-close" aria-label="Close full photo">&times;</button>
        <div class="achievement-lightbox-backdrop"></div>
        <figure class="achievement-lightbox-frame">
            <img src="" alt="">
        </figure>
    `;
    document.body.appendChild(photoLightbox);

    const closePhoto = function() {
        photoLightbox.classList.remove('is-open');
        document.body.classList.remove('achievement-lightbox-open');
        photoLightbox.querySelector('img').removeAttribute('src');
    };

    photoLightbox.querySelector('.achievement-lightbox-close').addEventListener('click', closePhoto);
    photoLightbox.querySelector('.achievement-lightbox-backdrop').addEventListener('click', closePhoto);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && photoLightbox.classList.contains('is-open')) closePhoto();
    });

    window.openSitePhoto = function(src, alt) {
        if (!src) return;
        const img = photoLightbox.querySelector('img');
        img.src = src;
        img.alt = alt || '';
        photoLightbox.classList.add('is-open');
        document.body.classList.add('achievement-lightbox-open');
        photoLightbox.querySelector('.achievement-lightbox-close').focus();
    };

    document.addEventListener('click', function(e) {
        const photo = e.target.closest('.leadership-picture, .leadership-detail-photo, .achievement-story-cover, .content-card-thumb, .software-project-cover, .gallery-item, .post-featured-image, .achievement-image, .achievement-detail-hero, .project-card-media');
        if (!photo || e.target.closest('a, button, .project-live-badge')) return;

        let src = '';
        let alt = 'Photo';
        if (photo.classList.contains('project-card-media')) {
            const match = (photo.style.backgroundImage || '').match(/url\((['"]?)(.*?)\1\)/);
            src = match ? match[2] : '';
        } else {
            const img = photo.querySelector('img');
            if (img) {
                src = img.currentSrc || img.src;
                alt = img.alt || alt;
            }
        }
        if (!src) return;
        e.preventDefault();
        window.openSitePhoto(src, alt);
    });
});
