import { handleFormSubmit } from './forms.js';
import { setupFocusTrap } from './ui-utils.js';
import { baixarFichaPdf } from './inscricao-pdf.js';
import { initInscricaoAssinaturaForm, resetInscricaoAssinaturaForm } from './inscricao-signature.js';

export function initInscricaoModal() {
    const overlay = document.getElementById('inscricao-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('inscricao-close');
    const openBtns = document.querySelectorAll('[data-modal-open="inscricao"]');
    const fieldsEl = document.getElementById('inscricao-fields');
    const assinarEl = document.getElementById('inscricao-assinar');
    const successEl = document.getElementById('inscricao-success');

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

    function resetFlow() {
        assinarEl?.classList.remove('is-visible');
        successEl?.classList.remove('is-visible');
        fieldsEl?.classList.remove('is-hidden');
        document.getElementById('inscricao-form')?.reset();
        assinarEl?.querySelector('.ins-callout__pdf-error')?.remove();
        resetInscricaoAssinaturaForm(overlay);
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
    ['civico'].forEach(val => {
        const el = overlay.querySelector(`input[value="${val}"]`);
        if (el) {
            el.checked = true;
            el.closest('.ins-radio-label')?.classList.add('is-checked');
        }
    });

    initInscricaoAssinaturaForm(overlay);

    handleFormSubmit(
        document.getElementById('inscricao-form'),
        fieldsEl,
        assinarEl,
        (formEl) => {
            const result = baixarFichaPdf(formEl);
            if (!result.ok) {
                const callout = assinarEl?.querySelector('.ins-callout');
                let warningEl = callout?.querySelector('.ins-callout__pdf-error');
                if (callout && !warningEl) {
                    warningEl = document.createElement('p');
                    warningEl.className = 'ins-callout__note ins-callout__pdf-error';
                    warningEl.style.color = 'var(--color-error)';
                    warningEl.textContent = 'Não foi possível gerar o PDF automaticamente. Por favor, contacte-nos por e-mail para lhe enviarmos a ficha para assinatura.';
                    callout.appendChild(warningEl);
                }
            }
        }
    );
}
