const RADIO_GROUP_LABELS = {
    tipo_associado: 'Categoria Pretendida',
    meio_comunicacao: 'Meio Preferencial de Comunicação'
};

const FIELD_LABELS = {
    nome: 'Nome completo',
    data_nascimento: 'Data de nascimento',
    nif: 'NIF',
    cc_bi: 'N.º CC / BI',
    morada: 'Morada',
    codigo_postal: 'Código Postal',
    localidade: 'Localidade',
    concelho: 'Concelho',
    distrito: 'Distrito',
    telefone: 'Telemóvel',
    email: 'E-mail',
    profissao: 'Profissão / Ocupação',
    local: 'Local',
    data_inscricao: 'Data'
};

const DECLARACOES = [
    { id: 'ins-estatutos', label: 'Aceitação dos estatutos e regulamentos internos' },
    { id: 'ins-rgpd', label: 'Autorização de tratamento de dados pessoais (RGPD)' }
];

function checkedRadioLabel(overlay, name) {
    const checked = overlay.querySelector(`input[name="${name}"]:checked`);
    if (!checked) return null;
    return checked.closest('.ins-radio-label')?.querySelector('.ins-radio-label__title')?.textContent?.trim()
        || checked.value;
}

function buildFieldList(formEl) {
    const overlay = formEl.closest('.inscricao-overlay') || document;
    const fields = [];

    fields.push([RADIO_GROUP_LABELS.tipo_associado, checkedRadioLabel(overlay, 'tipo_associado') || '—']);

    Object.entries(FIELD_LABELS).forEach(([name, label]) => {
        const input = formEl.querySelector(`[name="${name}"]`);
        const value = input ? input.value.trim() : '';
        if (value) fields.push([label, value]);
    });

    fields.push([RADIO_GROUP_LABELS.meio_comunicacao, checkedRadioLabel(overlay, 'meio_comunicacao') || '—']);

    DECLARACOES.forEach(({ id, label }) => {
        const el = formEl.querySelector(`#${id}`);
        fields.push([label, el?.checked ? 'Aceite' : 'Não aceite']);
    });

    return fields;
}

function slugify(text) {
    return text
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function baixarFichaPdf(formEl) {
    try {
        const jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDFCtor) {
            return { ok: false, error: 'jsPDF não carregou.' };
        }

        const doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
        const marginX = 56;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 64;

        const hoje = new Date().toLocaleDateString('pt-PT');

        doc.setFont('times', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text('ACIMHA — ASSOCIAÇÃO CÍVICA DE MUNÍCIPES E HABITAÇÃO DO ALGARVE', marginX, y);
        doc.text(hoje, pageWidth - marginX, y, { align: 'right' });
        y += 22;

        doc.setFont('times', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(20, 20, 20);
        doc.text('Ficha de Inscrição ACIMHA', marginX, y);
        y += 14;

        doc.setDrawColor(200, 194, 176);
        doc.setLineWidth(0.75);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 30;

        const fields = buildFieldList(formEl);
        const defaultLabelWidth = 150;
        const minValueWidth = 130;
        const lineHeight = 18;
        const bottomLimit = pageHeight - 90;
        const contentWidth = pageWidth - marginX * 2;

        fields.forEach(([label, value]) => {
            const labelText = `${label}:`;
            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            const labelTextWidth = doc.getTextWidth(labelText);

            const fitsSameLine = labelTextWidth + 10 <= defaultLabelWidth
                || labelTextWidth + 10 + minValueWidth <= contentWidth;

            let valueX, valueMaxWidth, labelLineHeight;
            if (fitsSameLine) {
                const column = Math.max(defaultLabelWidth, labelTextWidth + 10);
                valueX = marginX + column;
                valueMaxWidth = pageWidth - marginX - valueX;
                labelLineHeight = 0;
            } else {
                valueX = marginX + 14;
                valueMaxWidth = contentWidth - 14;
                labelLineHeight = lineHeight;
            }

            const valueLines = doc.splitTextToSize(String(value), valueMaxWidth);
            const blockHeight = labelLineHeight + Math.max(lineHeight, valueLines.length * lineHeight);

            if (y + blockHeight > bottomLimit) {
                doc.addPage();
                y = 64;
            }

            doc.setFont('times', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(20, 20, 20);
            doc.text(labelText, marginX, y);

            doc.setFont('times', 'normal');
            doc.setTextColor(40, 40, 40);
            doc.text(valueLines, valueX, y + labelLineHeight);

            y += blockHeight;
        });

        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFont('times', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(120, 120, 120);
            doc.text(
                'Documento gerado automaticamente a partir da ficha submetida em acimha.pt — carece de assinatura através da Chave Móvel Digital para validade oficial.',
                marginX, pageHeight - 46, { maxWidth: contentWidth - 60 }
            );
            doc.setFont('times', 'normal');
            doc.text(`${i} / ${totalPages}`, pageWidth - marginX, pageHeight - 46, { align: 'right' });
        }

        const nomeInput = formEl.querySelector('[name="nome"]');
        const slug = nomeInput && nomeInput.value.trim() ? slugify(nomeInput.value.trim()) : Date.now();
        const filename = `Ficha-Inscricao-ACIMHA-${slug}.pdf`;

        doc.save(filename);
        return { ok: true, filename };
    } catch (error) {
        console.error(error);
        return { ok: false, error };
    }
}
