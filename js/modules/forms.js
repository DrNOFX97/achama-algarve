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

export function handleFormSubmit(formEl, fieldsEl, successEl) {
    if (!formEl) return;

    formEl.addEventListener('submit', function (e) {
        e.preventDefault();

        let valid = true;
        const inputs = formEl.querySelectorAll('input, select, textarea');
        inputs.forEach(function (input) {
            setCustomValidity(input);
            if (!input.checkValidity()) {
                valid = false;
                input.reportValidity();
            }
        });

        if (valid) {
            var formData = new FormData(formEl);
            fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            }).catch(function () {
                // submit best-effort; show success regardless
            }).finally(function () {
                fieldsEl.classList.add('is-hidden');
                successEl.classList.add('is-visible');
                successEl.focus();
            });
        }
    });

    formEl.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.addEventListener('blur', function () {
            setCustomValidity(input);
        });
    });
}
