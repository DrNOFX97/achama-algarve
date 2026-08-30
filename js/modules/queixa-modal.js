import { setupFocusTrap } from './ui-utils.js';

// Formulário próprio, não o handleFormSubmit genérico de forms.js: esse
// serializa sempre como application/x-www-form-urlencoded, o que perde o
// conteúdo binário de um ficheiro. Aqui o campo de foto é opcional mas tem
// de viajar na mesma submissão multipart — mesmo padrão de fetch cru usado
// em inscricao-signature.js para o PDF assinado.
const MAX_FOTO_BYTES = 8 * 1024 * 1024;

export function initQueixaModal() {
    const overlay = document.getElementById('queixa-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('queixa-modal-close');
    const openBtns = document.querySelectorAll('[data-modal-open="queixa"]');
    const fieldsEl = document.getElementById('queixa-modal-fields');
    const successEl = document.getElementById('queixa-modal-success');
    const resetBtn = document.getElementById('queixa-modal-reset');
    const formEl = document.getElementById('queixa-modal-form');
    const fotoInput = document.getElementById('qx-foto');
    const fotoError = document.getElementById('qx-foto-error');
    const fotoNameEl = document.getElementById('qx-foto-name');

    let triggerBtn = null;

    // Sem isto, submeter com sucesso e depois fechar (X/Escape/clique fora,
    // não o botão "Submeter outra queixa") deixava successEl visível — a
    // próxima vez que se abrisse o modal via CTA mostrava logo o ecrã de
    // sucesso antigo em vez de um formulário limpo.
    function resetFlow() {
        successEl?.classList.remove('is-visible');
        fieldsEl?.classList.remove('is-hidden');
        formEl?.reset();
        if (fotoNameEl) fotoNameEl.textContent = '';
        if (fotoError) fotoError.style.display = 'none';
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
            if (triggerBtn) triggerBtn.focus();
            resetFlow();
        }
    }

    openBtns.forEach((btn) => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn);
    }));

    closeBtn?.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    setupFocusTrap(overlay);

    resetBtn?.addEventListener('click', () => {
        resetFlow();
        fieldsEl.querySelector('input, select, textarea')?.focus();
    });

    fotoInput?.addEventListener('change', () => {
        const file = fotoInput.files && fotoInput.files[0];
        if (fotoError) fotoError.style.display = 'none';
        if (fotoNameEl) fotoNameEl.textContent = '';
        if (!file) return;

        if (file.size > MAX_FOTO_BYTES) {
            if (fotoError) {
                fotoError.textContent = 'Este ficheiro é demasiado grande (máx. 8MB). Escolha outra foto.';
                fotoError.style.display = 'block';
            }
            fotoInput.value = '';
            return;
        }
        if (fotoNameEl) fotoNameEl.textContent = file.name;
    });

    if (!formEl) return;

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();

        let valid = true;
        formEl.querySelectorAll('input, select, textarea').forEach((input) => {
            if (!input.checkValidity()) {
                valid = false;
                input.reportValidity();
            }
        });
        if (!valid) return;

        const submitBtn = formEl.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'A submeter...';
        }

        let alertEl = formEl.querySelector('.form__alert--error');
        if (!alertEl) {
            alertEl = document.createElement('div');
            alertEl.className = 'form__alert form__alert--error';
            alertEl.setAttribute('role', 'alert');
            alertEl.setAttribute('aria-live', 'polite');
            formEl.appendChild(alertEl);
        }
        alertEl.style.display = 'none';
        alertEl.textContent = '';

        const formData = new FormData(formEl);

        fetch('/', { method: 'POST', body: formData })
            .then((response) => {
                if (!response.ok) throw new Error('HTTP error ' + response.status);
                fieldsEl.classList.add('is-hidden');
                successEl.classList.add('is-visible');
                successEl.focus();
            })
            .catch(() => {
                alertEl.textContent = 'Lamentamos, mas ocorreu um erro ao submeter a queixa. Por favor, verifique a sua ligação e tente novamente.';
                alertEl.style.display = 'block';
                alertEl.focus();
            })
            .finally(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
    });

    formEl.querySelectorAll('input, select, textarea').forEach((input) => {
        input.addEventListener('blur', () => input.checkValidity());
    });
}
