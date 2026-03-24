import { handleFormSubmit } from './forms.js';

export function initContactModal() {
    const overlay = document.getElementById('contact-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('contact-modal-close');
    const openBtns = document.querySelectorAll('[data-modal-open="contact"]');
    const fieldsEl = document.getElementById('contact-modal-fields');
    const successEl = document.getElementById('contact-modal-success');
    const resetBtn = document.getElementById('contact-modal-reset');

    function openModal() {
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
    }

    function closeModal() {
        overlay.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    openBtns.forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        openModal();
    }));

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    // Reset para enviar nova mensagem
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            successEl.classList.remove('is-visible');
            fieldsEl.classList.remove('is-hidden');
            document.getElementById('contact-modal-form')?.reset();
            fieldsEl.querySelector('input, select, textarea')?.focus();
        });
    }

    handleFormSubmit(
        document.getElementById('contact-modal-form'),
        fieldsEl,
        successEl
    );
}
