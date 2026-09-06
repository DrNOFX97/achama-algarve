const PDF_SIGNATURE = '%PDF-';
const CMD_SIZE_WARNING_BYTES = 3 * 1024 * 1024;

async function looksLikePdf(file) {
    if (!file || file.size === 0) return false;
    const head = await file.slice(0, 5).text();
    return head === PDF_SIGNATURE;
}

export function onAssinaturaConcluida(context) {
    // Ponto de entrada para a futura integração de pagamento (Stripe Checkout).
    console.info('[inscricao] documento assinado recebido — pronto para o passo de pagamento.', context);
}

// Dispara e esquece: os emails de confirmação (associado + admin) nunca
// devem bloquear nem mostrar erro no ecrã de sucesso — a submissão ao
// Netlify Forms, já concluída antes disto ser chamado, é a fonte de
// verdade da inscrição.
function notificarConfirmacaoAssinatura(token) {
    if (!token) return;
    fetch('/.netlify/functions/send-assinatura-confirmacao', {
        method: 'POST',
        body: JSON.stringify({ token }),
    }).catch(() => {});
}

export function initInscricaoAssinaturaForm(overlay, token) {
    const formEl = overlay.querySelector('#inscricao-assinatura-form');
    const stepEl = overlay.querySelector('#inscricao-assinar');
    const successEl = overlay.querySelector('#inscricao-success');
    if (!formEl || !stepEl || !successEl) return;

    const fileInput = formEl.querySelector('#ins-assinatura-file');
    const errorEl = formEl.querySelector('.form__error');
    const filenameEl = formEl.querySelector('.ins-file-preview__name');
    const submitBtn = formEl.querySelector('button[type="submit"]');

    function setError(message) {
        if (!errorEl) return;
        errorEl.textContent = message || '';
        errorEl.style.display = message ? 'block' : 'none';
    }

    fileInput?.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        setError('');
        if (submitBtn) submitBtn.disabled = true;
        if (filenameEl) filenameEl.textContent = '';

        if (!file) return;

        const isPdf = await looksLikePdf(file);
        if (!isPdf) {
            setError('Este ficheiro não parece ser um PDF válido. Por favor, carregue o PDF assinado.');
            fileInput.value = '';
            return;
        }

        if (file.size > CMD_SIZE_WARNING_BYTES) {
            setError('Nota: este ficheiro tem mais de 3MB — confirme que é mesmo o PDF assinado deste documento.');
        }

        if (filenameEl) filenameEl.textContent = file.name;
        if (submitBtn) submitBtn.disabled = false;
    });

    formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!submitBtn || submitBtn.disabled) return;

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'A enviar...';

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

        fetch('/', {
            method: 'POST',
            body: formData
        })
        .then((response) => {
            if (!response.ok) throw new Error('HTTP error ' + response.status);

            stepEl.classList.remove('is-visible');
            successEl.classList.add('is-visible');
            successEl.focus();
            notificarConfirmacaoAssinatura(token);
            onAssinaturaConcluida({ filename: fileInput?.files?.[0]?.name });
        })
        .catch(() => {
            alertEl.textContent = 'Lamentamos, mas ocorreu um erro ao enviar o documento assinado. Por favor, verifique a sua ligação e tente novamente.';
            alertEl.style.display = 'block';
            alertEl.focus();
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
    });
}

export function resetInscricaoAssinaturaForm(overlay) {
    const formEl = overlay.querySelector('#inscricao-assinatura-form');
    if (!formEl) return;
    formEl.reset();
    const emailEl = formEl.querySelector('#ins-assinatura-email');
    if (emailEl) emailEl.value = '';
    const errorEl = formEl.querySelector('.form__error');
    if (errorEl) errorEl.style.display = 'none';
    const filenameEl = formEl.querySelector('.ins-file-preview__name');
    if (filenameEl) filenameEl.textContent = '';
    const submitBtn = formEl.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    formEl.querySelector('.form__alert--error')?.remove();
}
