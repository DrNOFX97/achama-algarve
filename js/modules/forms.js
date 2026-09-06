export function setCustomValidity(input) {
    input.setCustomValidity('');
    if (!input.checkValidity()) {
        const type = input.type;
        if (input.validity.valueMissing) {
            if (type === 'checkbox') {
                input.setCustomValidity('É necessário aceitar a política de privacidade.');
            } else if (input.tagName.toLowerCase() === 'select') {
                input.setCustomValidity('Por favor, faça uma seleção.');
            } else if (type === 'email') {
                input.setCustomValidity('Por favor, introduza um endereço de e-mail.');
            } else {
                input.setCustomValidity('Este campo é obrigatório.');
            }
        } else if (input.validity.typeMismatch && type === 'email') {
            input.setCustomValidity('Por favor, introduza um endereço de e-mail válido (exemplo@domínio.pt).');
        } else if (input.validity.tooShort) {
            input.setCustomValidity('Este campo precisa de mais ' + (input.minLength - input.value.length) + ' caractere(s).');
        }
    }
}

export function handleFormSubmit(formEl, fieldsEl, successEl, onSuccess, preSubmitCheck) {
    if (!formEl) return;

    formEl.addEventListener('submit', async function (e) {
        e.preventDefault();

        // fieldsEl/successEl são resolvidos uma vez, à parte, quando o módulo do
        // modal inicializa (init corre em DOMContentLoaded). Em produção — nunca
        // reproduzido em deploy previews com o mesmo código, causa raiz não
        // isolada — essa resolução por vezes captura null mesmo com o elemento
        // presente no HTML, e falhava silenciosamente ao mostrar o ecrã de
        // sucesso (nem envio de email chegava a acontecer). Reobter aqui, a
        // partir da estrutura real do form (fields = pai direto do <form>,
        // success = irmão seguinte), corrige isto independentemente da causa.
        const fields = fieldsEl || formEl.parentElement;
        const success = successEl || (fields && fields.nextElementSibling);

        let valid = true;
        const inputs = formEl.querySelectorAll('input, select, textarea');
        inputs.forEach(function (input) {
            setCustomValidity(input);
            if (!input.checkValidity()) {
                valid = false;
                input.reportValidity();
            }
        });

        if (valid && typeof preSubmitCheck === 'function') {
            const check = await preSubmitCheck(formEl);
            if (check && check.ok === false) {
                let errorMsgEl = formEl.querySelector('.form__alert--error');
                if (!errorMsgEl) {
                    errorMsgEl = document.createElement('div');
                    errorMsgEl.className = 'form__alert form__alert--error';
                    errorMsgEl.setAttribute('role', 'alert');
                    errorMsgEl.setAttribute('aria-live', 'polite');
                    errorMsgEl.setAttribute('tabindex', '-1');

                    const submitRow = formEl.querySelector('.ins-submit-row, .contact-modal__submit-row') || formEl.querySelector('button[type="submit"]');
                    if (submitRow) {
                        submitRow.parentNode.insertBefore(errorMsgEl, submitRow);
                    } else {
                        formEl.appendChild(errorMsgEl);
                    }
                }
                errorMsgEl.textContent = check.message || 'Não é possível submeter este formulário.';
                errorMsgEl.style.display = 'block';
                errorMsgEl.focus();
                valid = false;
            }
        }

        if (valid) {
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
            
            // Gerar ou obter elemento de erro dinâmico
            let errorMsgEl = formEl.querySelector('.form__alert--error');
            if (!errorMsgEl) {
                errorMsgEl = document.createElement('div');
                errorMsgEl.className = 'form__alert form__alert--error';
                errorMsgEl.setAttribute('role', 'alert');
                errorMsgEl.setAttribute('aria-live', 'polite');
                errorMsgEl.setAttribute('tabindex', '-1');

                const submitRow = formEl.querySelector('.ins-submit-row, .contact-modal__submit-row') || submitBtn;
                if (submitRow) {
                    submitRow.parentNode.insertBefore(errorMsgEl, submitRow);
                } else {
                    formEl.appendChild(errorMsgEl);
                }
            }

            // Ocultar erros anteriores
            errorMsgEl.style.display = 'none';
            errorMsgEl.textContent = '';

            // Desativar botão e mostrar estado de loading
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'A submeter...';
            }

            var formData = new FormData(formEl);
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('HTTP error ' + response.status);
                }
                // Sucesso
                fields.classList.add('is-hidden');
                success.classList.add('is-visible');
                success.focus();
                if (typeof onSuccess === 'function') {
                    try { onSuccess(formEl); } catch (err) { console.error(err); }
                }
            })
            .catch(function (error) {
                // Erro
                errorMsgEl.textContent = 'Lamentamos, mas ocorreu um erro ao submeter o formulário. Por favor, verifique a sua ligação e tente novamente.';
                errorMsgEl.style.display = 'block';
                errorMsgEl.focus();
            })
            .finally(function () {
                // Restaurar estado do botão
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    });

    formEl.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.addEventListener('blur', function () {
            setCustomValidity(input);
        });
    });
}
