import { initNavScroll, initMobileMenu, initScrollSpy, initFadeIn, initHeroPhotos } from './modules/ui-utils.js';
import { handleFormSubmit } from './modules/forms.js';
import { initTabs } from './modules/tabs.js';
import { initObservatory } from './modules/observatory.js';
import { OBS_DATA } from './data/observatory-data.js';
import { initInscricaoModal } from './modules/inscricao-modal.js';
import { initContactModal } from './modules/contact-modal.js';

document.addEventListener('DOMContentLoaded', () => {
    const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };

    // Navigation
    safe(() => {
        const nav = document.getElementById('main-nav');
        if (nav) initNavScroll(nav);
    });

    // Mobile Menu
    safe(() => {
        const hamburger = document.getElementById('hamburger-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuClose = document.getElementById('menu-close-btn');
        if (hamburger && mobileMenu && menuClose) initMobileMenu(hamburger, mobileMenu, menuClose);
    });

    // Scroll Spy
    safe(() => {
        const sections = document.querySelectorAll('main > section[id]');
        const navLinks = document.querySelectorAll('.nav__links a, .nav__menu a');
        if (sections.length && navLinks.length) initScrollSpy(sections, navLinks);
    });

    // Fade In
    safe(() => {
        const fadeElements = document.querySelectorAll('.fade-in');
        if (fadeElements.length) initFadeIn(fadeElements);
    });

    // Hero Photos
    safe(() => {
        const heroPhotos = document.querySelectorAll('.hero__photo');
        if (heroPhotos.length) initHeroPhotos(heroPhotos);
    });

    // Tabs
    safe(() => {
        const tabList = document.querySelector('.tabs__list');
        if (tabList) initTabs(tabList);
    });

    // Forms (legacy inline membership form, if present)
    safe(() => handleFormSubmit(
        document.getElementById('membership-form'),
        document.getElementById('membership-fields'),
        document.getElementById('membership-success')
    ));

    // Observatory
    safe(() => initObservatory(OBS_DATA));

    // Ficha de Inscrição (modal)
    safe(() => initInscricaoModal());

    // Modal de Contacto
    safe(() => initContactModal());
});
