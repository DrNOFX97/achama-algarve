import { handleFormSubmit } from './forms.js';
import { setupFocusTrap } from './ui-utils.js';

export function initInscricaoModal() {
    const overlay = document.getElementById('inscricao-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('inscricao-close');
    const openBtns = document.querySelectorAll('[data-modal-open="inscricao"]');

    let triggerBtn = null;

    function openModal(trigger) {
        triggerBtn = trigger;
        overlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();

        // Pré-preencher data de hoje
        const dataEl = document.getElementById('ins-data');
        if (dataEl && !dataEl.value) {
            dataEl.value = new Date().toLocaleDateString('pt-PT');
        }
    }

    function closeModal() {
        if (overlay.classList.contains('is-open')) {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
            if (triggerBtn) {
                triggerBtn.focus();
            }
        }
    }

    openBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            openModal(btn);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    setupFocusTrap(overlay);

    // Estado visual dos rádios
    overlay.querySelectorAll('.ins-radio-group').forEach(group => {
        group.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                group.querySelectorAll('.ins-radio-label').forEach(label => {
                    label.classList.toggle(
                        'is-checked',
                        label.querySelector('input[type="radio"]') === radio
                    );
                });
            });
        });
    });

    // Pré-seleccionar valores por defeito
    ['civico', 'semestral'].forEach(val => {
        const el = overlay.querySelector(`input[value="${val}"]`);
        if (el) {
            el.checked = true;
            el.closest('.ins-radio-label')?.classList.add('is-checked');
        }
    });

    handleFormSubmit(
        document.getElementById('inscricao-form'),
        document.getElementById('inscricao-fields'),
        document.getElementById('inscricao-success')
    );
}
