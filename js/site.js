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

    document.querySelectorAll('.navLink').forEach(link => {
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
    document.querySelectorAll('.navLink').forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === page || (page === '' && href === 'index.html')) {
            link.style.color = 'var(--primaryColor)';
        }
    });
});
