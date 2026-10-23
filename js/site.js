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
});
