import { handleFormSubmit } from './forms.js';
import { setupFocusTrap } from './ui-utils.js';
import { baixarFichaDocx } from './inscricao-docx.js';

export function initInscricaoModal() {
    const overlay = document.getElementById('inscricao-overlay');
    if (!overlay) return;

    const closeBtn = document.getElementById('inscricao-close');
    const openBtns = document.querySelectorAll('[data-modal-open="inscricao"]');
    const fieldsEl = document.getElementById('inscricao-fields');
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
        successEl?.classList.remove('is-visible');
        fieldsEl?.classList.remove('is-hidden');
        document.getElementById('inscricao-form')?.reset();
        const retomarTextEl = overlay.querySelector('#ins-retomar-link-text');
        if (retomarTextEl) {
            retomarTextEl.textContent = 'A preparar o link de retomar…';
            retomarTextEl.hidden = true;
        }
        const envioNoteEl = overlay.querySelector('#ins-envio-note');
        if (envioNoteEl) envioNoteEl.textContent = 'A enviar o email…';
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

    async function checkNifDuplicado(formEl) {
        const nif = formEl.querySelector('[name="nif"]')?.value || '';
        try {
            const res = await fetch('/.netlify/functions/check-nif-duplicado', {
                method: 'POST',
                body: JSON.stringify({ nif }),
            });
            if (!res.ok) return { ok: true }; // bloqueador indisponível não deve travar inscrições legítimas
            const data = await res.json();
            if (data.duplicado) {
                return {
                    ok: false,
                    message: 'Já existe uma inscrição com este NIF. Se for um engano ou precisar de ajuda, contacte-nos em acimha.geral@gmail.com.',
                };
            }
            return { ok: true };
        } catch {
            return { ok: true };
        }
    }

    async function criarTokenRetomar(email, nome) {
        try {
            const res = await fetch('/.netlify/functions/create-inscricao-token', {
                method: 'POST',
                body: JSON.stringify({ email, nome }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.token || null;
        } catch {
            return null;
        }
    }

    function mostrarRetomarLink(url) {
        const textEl = overlay.querySelector('#ins-retomar-link-text');
        if (!textEl) return;
        textEl.hidden = false;
        if (url) {
            textEl.textContent = '';
            const link = document.createElement('a');
            link.href = url;
            link.textContent = url;
            link.rel = 'noopener noreferrer';
            textEl.appendChild(link);
        } else {
            textEl.textContent = 'Não foi possível preparar o link de retomar agora — contacte-nos em acimha.geral@gmail.com se precisar dele mais tarde.';
        }
    }

    async function enviarFichaPorEmail({ email, nome, token, filename, blob }) {
        if (!token || !blob) return false;
        try {
            const arrayBuffer = await blob.arrayBuffer();
            const docxBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            const res = await fetch('/.netlify/functions/send-inscricao-docx', {
                method: 'POST',
                body: JSON.stringify({ email, nome, token, filename, docxBase64 }),
            });
            if (!res.ok) return false;
            const data = await res.json();
            return !!data.sent;
        } catch {
            return false;
        }
    }

    handleFormSubmit(
        document.getElementById('inscricao-form'),
        fieldsEl,
        successEl,
        async (formEl) => {
            const email = formEl.querySelector('[name="email"]')?.value || '';
            const nome = formEl.querySelector('[name="nome"]')?.value || '';

            const tokenPromise = criarTokenRetomar(email, nome);
            const result = await baixarFichaDocx(formEl);
            const token = await tokenPromise;
            const envioNoteEl = overlay.querySelector('#ins-envio-note');

            if (!result.ok) {
                if (envioNoteEl) {
                    envioNoteEl.textContent = 'Não foi possível gerar o documento automaticamente — utilize o link abaixo para continuar a assinatura, ou contacte-nos em acimha.geral@gmail.com.';
                }
                mostrarRetomarLink(token ? `${location.origin}/assinatura?token=${token}` : null);
                return;
            }

            const enviado = await enviarFichaPorEmail({ email, nome, token, filename: result.filename, blob: result.blob });

            if (enviado) {
                if (envioNoteEl) envioNoteEl.textContent = 'Enviámos o documento e as instruções de assinatura para o seu email.';
            } else {
                if (envioNoteEl) {
                    envioNoteEl.textContent = 'Ainda não foi possível enviar o email — utilize o link abaixo para continuar a assinatura, ou contacte-nos em acimha.geral@gmail.com.';
                }
                mostrarRetomarLink(token ? `${location.origin}/assinatura?token=${token}` : null);
            }
        },
        checkNifDuplicado
    );
}
