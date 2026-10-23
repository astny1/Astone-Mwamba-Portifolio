document.addEventListener('DOMContentLoaded', function() {
    // Hero entrance animation
    const homeSection = document.querySelector('.home');
    if (homeSection) {
        requestAnimationFrame(function() {
            homeSection.classList.add('is-loaded');
        });
    }

    // Scroll reveal for sections and cards
    const revealSelectors = [
        '.sectionTitle',
        '.contentHeader',
        '#skills .skill-card',
        '.skillInfo-main',
        '.certificates-content .skillInfo-cert',
        '.project-card',
        '.software-project-card',
        '.box-testimonial',
        '.about .cta',
        '.about .lower',
        '.achievement-counters .counter-box',
        '.contactContent',
        '.leadership-summary',
        '.leadership-door',
        '.leadership-event',
        '.leadership-video',
        '.leadership-role',
        '.leadership-metric',
        '.leadership-global-item',
        '.leadership-book-card'
    ];

    revealSelectors.forEach(function(selector) {
        document.querySelectorAll(selector).forEach(function(el, index) {
            el.classList.add('reveal-on-scroll');
            el.style.transitionDelay = (index % 5) * 0.08 + 's';
        });
    });

    const revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(function(el) {
        revealObserver.observe(el);
    });

    // Smooth scroll (index page sections)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#' || href.includes('.html')) return;
            const targetId = href.includes('#') ? href.split('#')[1] : href.slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;
            e.preventDefault();
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Counter animation
    function animateCounters() {
        document.querySelectorAll('.counter').forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const speed = 50;
            const incrementTime = 50;

            const update = () => {
                const count = +counter.innerText.replace(/\D/g, '') || 0;
                const increment = target / speed;
                if (count < target) {
                    counter.innerText = Math.ceil(count + increment);
                    setTimeout(update, incrementTime);
                } else {
                    counter.innerText = target + '+';
                }
            };
            update();
        });
    }

    const counterSection = document.querySelector('.achievement-counters');
    if (counterSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counterObserver.observe(counterSection);
    }

    document.querySelectorAll('.leadership-video-play').forEach(function(btn) {
        const embed = (btn.getAttribute('data-embed') || '').trim();
        if (!embed) return;
        btn.disabled = false;
        const status = btn.parentElement && btn.parentElement.querySelector('.leadership-video-status');
        if (status) status.hidden = true;
        btn.addEventListener('click', function() {
            const frame = btn.closest('.leadership-video-frame');
            if (!frame) return;
            const iframe = document.createElement('iframe');
            iframe.src = embed;
            iframe.title = btn.getAttribute('aria-label') || 'Impact video';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            frame.replaceChildren(iframe);
        });
    });

    // Netlify Forms (AJAX — stay on page)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        const submitBtn = document.getElementById('contact-submit-btn');
        const defaultBtnHtml = submitBtn ? submitBtn.innerHTML : 'Send';

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            if (formStatus) {
                formStatus.textContent = '';
                formStatus.className = 'form-status';
            }
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Sending...';
            }

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(new FormData(contactForm)).toString()
                });

                if (!response.ok) {
                    throw new Error('Send failed');
                }

                contactForm.reset();
                if (formStatus) {
                    formStatus.innerHTML = '<i class="uil uil-check-circle"></i> Thank You! Your request has been sent successfully.';
                    formStatus.classList.add('form-status--success');
                }
            } catch (err) {
                if (formStatus) {
                    formStatus.textContent = 'Could not send. Please email astone@astonemwamba.com directly.';
                    formStatus.classList.add('form-status--error');
                }
            } finally {
                if (submitBtn) {
                    submitBtn.innerHTML = defaultBtnHtml;
                    submitBtn.disabled = false;
                }
            }
        });
    }
});
