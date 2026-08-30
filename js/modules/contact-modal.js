import { handleFormSubmit } from './forms.js';
import { setupFocusTrap } from './ui-utils.js';

export function initContactModal() {
    const overlay = document.getElementById('contact-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('contact-modal-close');
    const openBtns = document.querySelectorAll('[data-modal-open="contact"]');
    const fieldsEl = document.getElementById('contact-modal-fields');
    const successEl = document.getElementById('contact-modal-success');
    const resetBtn = document.getElementById('contact-modal-reset');

    let triggerBtn = null;

    // Sem isto, submeter com sucesso e depois fechar (X/Escape/clique fora,
    // não o botão "Enviar outra mensagem") deixava successEl visível — a
    // próxima vez que se abrisse o modal mostrava logo o ecrã de sucesso
    // antigo em vez de um formulário limpo.
    function resetFlow() {
        successEl?.classList.remove('is-visible');
        fieldsEl?.classList.remove('is-hidden');
        document.getElementById('contact-modal-form')?.reset();
    }

    function openModal(trigger) {
        triggerBtn = trigger;
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
    }

    function closeModal() {
        if (overlay.classList.contains('is-open')) {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
            if (triggerBtn) {
                triggerBtn.focus();
            }
            resetFlow();
        }
    }

    openBtns.forEach(btn => btn.addEventListener('click', e => {
        e.preventDefault();
        openModal(btn);
    }));

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    setupFocusTrap(overlay);

    // Reset para enviar nova mensagem
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetFlow();
            fieldsEl.querySelector('input, select, textarea')?.focus();
        });
    }

    handleFormSubmit(
        document.getElementById('contact-modal-form'),
        fieldsEl,
        successEl
    );
}
