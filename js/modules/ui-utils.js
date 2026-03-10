export function initNavScroll(nav) {
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                nav.classList.toggle('nav--scrolled', window.scrollY > 80);
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

export function initMobileMenu(hamburger, mobileMenu, menuClose) {
    function openMenu() {
        mobileMenu.classList.add('nav__menu--open');
        hamburger.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        mobileMenu.classList.remove('nav__menu--open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });
}

export function initScrollSpy(sections, navLinks) {
    function setActiveLink(id) {
        navLinks.forEach(function (link) {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === '#' + id);
        });
    }

    const spyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                setActiveLink(entry.target.id);
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(function (s) { spyObserver.observe(s); });
}

export function initFadeIn(fadeElements) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        const fadeObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    fadeObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        fadeElements.forEach(function (el) {
            fadeObserver.observe(el);
        });
    } else {
        fadeElements.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }
}

export function initHeroPhotos(heroPhotos) {
    if (heroPhotos.length > 1) {
        let heroCurrent = 0;
        setInterval(function () {
            heroPhotos[heroCurrent].classList.remove('hero__photo--active');
            heroCurrent = (heroCurrent + 1) % heroPhotos.length;
            heroPhotos[heroCurrent].classList.add('hero__photo--active');
        }, 4000);
    }
}
