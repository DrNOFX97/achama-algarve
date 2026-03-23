import { initNavScroll, initMobileMenu, initScrollSpy, initFadeIn, initHeroPhotos } from './modules/ui-utils.js';
import { handleFormSubmit } from './modules/forms.js';
import { initTabs } from './modules/tabs.js';
import { initObservatory } from './modules/observatory.js';
import { OBS_DATA } from './data/observatory-data.js';
import { initInscricaoModal } from './modules/inscricao-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const nav = document.getElementById('main-nav');
    if (nav) initNavScroll(nav);

    // Mobile Menu
    const hamburger = document.getElementById('hamburger-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('menu-close-btn');
    if (hamburger && mobileMenu && menuClose) {
        initMobileMenu(hamburger, mobileMenu, menuClose);
    }

    // Scroll Spy
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav__links a, .nav__menu a');
    if (sections.length && navLinks.length) {
        initScrollSpy(sections, navLinks);
    }

    // Fade In
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length) initFadeIn(fadeElements);

    // Hero Photos
    const heroPhotos = document.querySelectorAll('.hero__photo');
    if (heroPhotos.length) initHeroPhotos(heroPhotos);

    // Tabs
    const tabList = document.querySelector('.tabs__list');
    if (tabList) initTabs(tabList);

    // Forms
    handleFormSubmit(
        document.getElementById('membership-form'),
        document.getElementById('membership-fields'),
        document.getElementById('membership-success')
    );
    handleFormSubmit(
        document.getElementById('contact-form'),
        document.getElementById('contact-fields'),
        document.getElementById('contact-success')
    );

    // Observatory
    initObservatory(OBS_DATA);

    // Ficha de Inscrição (modal)
    initInscricaoModal();
});
