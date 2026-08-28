const ASSOCIACAO_NOME = 'ACIMHA';
const ASSOCIACAO_NOME_COMPLETO = 'Associação Cívica de Munícipes e Habitação do Algarve';
const ASSOCIACAO_NIPC = '519597265';
const LOGO_PATH = 'assets/images/ACIMHA.png';

// Tamanhos em meios-pontos (docx.js). Documento tem de caber numa única
// página A4 — por isso o corpo compacto e a declaração/quotas mais pequenas.
const TITLE_SIZE = 34;   // 17pt
const SECTION_SIZE = 22; // 11pt
const BODY_SIZE = 20;    // 10pt
const SMALL_SIZE = 18;   // 9pt — declaração e quotas
const FOOTER_SIZE = 16;  // 8pt

const SINGLE_LINE = { line: 240, lineRule: 'auto' };

const TIPO_ASSOCIADO_OPTIONS = [
    { value: 'civico', label: 'Sócio Cívico' },
    { value: 'habitacional', label: 'Sócio Habitacional' }
];

const MEIO_COMUNICACAO_OPTIONS = [
    { value: 'email', label: 'E-mail' },
    { value: 'carta', label: 'Carta / correio postal' },
    { value: 'telemovel', label: 'Telemóvel para contactos informais' }
];

function getFieldValue(formEl, name) {
    return formEl.querySelector(`[name="${name}"]`)?.value?.trim() || '';
}

function getCheckedValue(formEl, name) {
    return formEl.querySelector(`input[name="${name}"]:checked`)?.value || null;
}

function isChecked(formEl, id) {
    return !!formEl.querySelector(`#${id}`)?.checked;
}

// Localidade e Concelho aparecem como um só campo no documento: se forem
// iguais (caso comum, ex. Faro/Faro), mostra-se só uma vez.
export function formatLocalidade(localidade, concelho) {
    const loc = (localidade || '').trim();
    const conc = (concelho || '').trim();
    if (!loc && !conc) return '—';
    if (!conc || loc.toLowerCase() === conc.toLowerCase()) return loc || conc;
    return `${loc}, ${conc}`;
}

// Nome do ficheiro: sem acentos nem caracteres especiais, espaços viram "_",
// nunca corta letras do nome — tem de ficar completo e legível.
const COMBINING_MARKS_RE = /[̀-ͯ]/g;

export function normalizarNomeFicheiro(nome) {
    const semAcentos = (nome || '')
        .normalize('NFD')
        .replace(COMBINING_MARKS_RE, '');
    return semAcentos
        .replace(/[^a-zA-Z0-9 ]+/g, '')
        .trim()
        .replace(/\s+/g, '_');
}

async function fetchLogoBytes() {
    const response = await fetch(LOGO_PATH);
    if (!response.ok) throw new Error('Não foi possível carregar o logótipo.');
    return response.arrayBuffer();
}

function buildDocument(docx, formEl, logoBytes) {
    const {
        Document, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer,
        AlignmentType, BorderStyle, WidthType, ImageRun, HeadingLevel
    } = docx;

    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const noBorders = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
    const THIN_LINE = { style: BorderStyle.SINGLE, size: 4, color: 'C8C2B0' };
    const THICK_LINE = { style: BorderStyle.SINGLE, size: 24, color: '1A1A1A' };
    const CELL_MARGINS = { top: 20, bottom: 20, left: 0, right: 0 };

    function fieldRow(label, value) {
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    margins: { ...CELL_MARGINS, right: 80 },
                    children: [new Paragraph({
                        spacing: SINGLE_LINE,
                        children: [new TextRun({ text: `${label}:`, bold: true, font: 'Cambria', size: BODY_SIZE })]
                    })]
                }),
                new TableCell({
                    width: { size: 70, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    margins: CELL_MARGINS,
                    children: [new Paragraph({
                        spacing: SINGLE_LINE,
                        children: [new TextRun({ text: value || '—', font: 'Calibri', size: BODY_SIZE })]
                    })]
                })
            ]
        });
    }

    function fieldTable(rows) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(([label, value]) => fieldRow(label, value))
        });
    }

    function sectionHeading(number, title) {
        return new Paragraph({
            heading: HeadingLevel.HEADING_2,
            border: { top: THIN_LINE },
            spacing: { before: 120, after: 60, ...SINGLE_LINE },
            children: [new TextRun({ text: `${number}. ${title}`, bold: true, font: 'Cambria', size: SECTION_SIZE })]
        });
    }

    function bodyText(text, opts = {}) {
        return new Paragraph({
            spacing: { after: 40, ...SINGLE_LINE },
            children: [new TextRun({ text, font: 'Calibri', size: SMALL_SIZE, ...opts })]
        });
    }

    function checkboxOption(opt, selectedValue) {
        const checked = opt.value === selectedValue;
        return new Paragraph({
            spacing: SINGLE_LINE,
            children: [
                new TextRun({ text: checked ? '☑ ' : '☐ ', font: 'Calibri', size: BODY_SIZE, bold: checked }),
                new TextRun({ text: opt.label, font: 'Calibri', size: BODY_SIZE, bold: checked })
            ]
        });
    }

    function checkboxRow(options, selectedValue) {
        const width = Math.floor(100 / options.length);
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [new TableRow({
                children: options.map(opt => new TableCell({
                    width: { size: width, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    margins: CELL_MARGINS,
                    children: [checkboxOption(opt, selectedValue)]
                }))
            })]
        });
    }

    const tipoAssociado = getCheckedValue(formEl, 'tipo_associado');
    const meioComunicacao = getCheckedValue(formEl, 'meio_comunicacao');
    const localidadeFormatada = formatLocalidade(getFieldValue(formEl, 'localidade'), getFieldValue(formEl, 'concelho'));

    const identificacaoRows = [
        ['Nome completo', getFieldValue(formEl, 'nome')],
        ['Data de nascimento', getFieldValue(formEl, 'data_nascimento')],
        ['NIF', getFieldValue(formEl, 'nif')],
        ['N.º CC/BI', getFieldValue(formEl, 'cc_bi')],
        ['Morada', getFieldValue(formEl, 'morada')],
        ['Código Postal', getFieldValue(formEl, 'codigo_postal')],
        ['Localidade', localidadeFormatada],
        ['Telemóvel', getFieldValue(formEl, 'telefone')],
        ['E-mail', getFieldValue(formEl, 'email')],
        ['Profissão', getFieldValue(formEl, 'profissao')]
    ];

    const local = getFieldValue(formEl, 'local');
    const dataInscricao = getFieldValue(formEl, 'data_inscricao');

    // Cabeçalho: o único logótipo existente no repositório já inclui o
    // nome "ACIMHA" e a designação completa como parte da própria imagem
    // (assets/images/ACIMHA.png, o mesmo usado na navegação do site) — por
    // isso não se duplica esse texto ao lado, só se mostra a imagem
    // (pequena, para caber dentro da margem de 2cm), seguida da linha
    // grossa pedida.
    const header = new Header({
        children: [
            new Paragraph({
                border: { bottom: THICK_LINE },
                spacing: { after: 60 },
                children: [new ImageRun({
                    data: logoBytes,
                    transformation: { width: 56, height: 42 },
                    type: 'png'
                })]
            })
        ]
    });

    const footer = new Footer({
        children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: SINGLE_LINE,
            children: [new TextRun({ text: `${ASSOCIACAO_NOME} · NIPC ${ASSOCIACAO_NIPC}`, font: 'Calibri', size: FOOTER_SIZE, color: '595959' })]
        })]
    });

    const body = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120, ...SINGLE_LINE },
            children: [new TextRun({ text: 'PROPOSTA / FICHA DE INSCRIÇÃO DE ASSOCIADO', bold: true, font: 'Cambria', size: TITLE_SIZE })]
        }),
        new Paragraph({
            spacing: { after: 60, ...SINGLE_LINE },
            children: [new TextRun({ text: 'CATEGORIA PRETENDIDA', bold: true, font: 'Cambria', size: SECTION_SIZE })]
        }),
        checkboxRow(TIPO_ASSOCIADO_OPTIONS, tipoAssociado),

        sectionHeading(1, 'IDENTIFICAÇÃO DO CANDIDATO'),
        fieldTable(identificacaoRows),

        sectionHeading(2, 'CONTACTO E COMUNICAÇÕES'),
        new Paragraph({
            spacing: { after: 40, ...SINGLE_LINE },
            children: [new TextRun({ text: 'Indique o meio preferencial para comunicações da Associação:', font: 'Calibri', size: BODY_SIZE })]
        }),
        checkboxRow(MEIO_COMUNICACAO_OPTIONS, meioComunicacao),

        sectionHeading(3, 'DECLARAÇÃO DO CANDIDATO'),
        bodyText(
            `Declaro que solicito a minha admissão na ${ASSOCIACAO_NOME} — ${ASSOCIACAO_NOME_COMPLETO}, na categoria acima indicada, e que:`,
            { bold: true }
        )
    ];

    [
        'tomei conhecimento de que a admissão como Sócio Cívico ou Sócio Habitacional depende de deliberação da Direção;',
        'comprometo-me, após a admissão, a respeitar os Estatutos, regulamentos e deliberações válidas dos órgãos sociais da ACIMHA;',
        'comprometo-me a contribuir para os fins da Associação, preservar o seu bom nome e cumprir as obrigações associativas que me sejam aplicáveis;',
        'autorizo a utilização dos dados fornecidos nesta ficha para efeitos de análise da candidatura, gestão da relação associativa, comunicações institucionais e cumprimento das obrigações legais da Associação, nos termos da legislação aplicável.'
    ].forEach(text => body.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 30, ...SINGLE_LINE },
        children: [new TextRun({ text, font: 'Calibri', size: SMALL_SIZE })]
    })));

    body.push(new Paragraph({
        spacing: { before: 60, after: 20, ...SINGLE_LINE },
        children: [
            new TextRun({ text: isChecked(formEl, 'ins-estatutos') ? '☑ ' : '☐ ', bold: true, size: BODY_SIZE }),
            new TextRun({ text: 'Aceitação dos estatutos e regulamentos internos', size: BODY_SIZE })
        ]
    }));
    body.push(new Paragraph({
        spacing: { after: 20, ...SINGLE_LINE },
        children: [
            new TextRun({ text: isChecked(formEl, 'ins-rgpd') ? '☑ ' : '☐ ', bold: true, size: BODY_SIZE }),
            new TextRun({ text: 'Autorização de tratamento de dados pessoais (RGPD)', size: BODY_SIZE })
        ]
    }));

    body.push(sectionHeading(4, 'QUOTAS E JOIA'));
    body.push(bodyText('Quota mensal: €5,00 (cinco euros), para os associados sujeitos a quotização.'));
    body.push(bodyText('Sócio Cívico: sem joia de inscrição.'));
    body.push(bodyText('Sócio Habitacional: joia de inscrição de €100,00 (cem euros), sem prejuízo das regras e obrigações específicas previstas para os programas habitacionais.'));
    body.push(bodyText('Pagamento de quotas: no primeiro ano recomenda-se, sem caráter obrigatório, o pagamento antecipado de 12 meses; nos anos seguintes recomenda-se o pagamento antecipado de pelo menos 6 meses, podendo o associado optar por outra periodicidade desde que mantenha as obrigações regularizadas.'));

    body.push(sectionHeading(5, 'ASSINATURA'));
    body.push(fieldTable([['Local', local], ['Data', dataInscricao]]));
    body.push(new Paragraph({
        spacing: { before: 150, ...SINGLE_LINE },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        children: [new TextRun({ text: '', size: 2 })]
    }));
    body.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 20, ...SINGLE_LINE },
        children: [new TextRun({ text: 'Assinatura do candidato', italics: true, font: 'Calibri', size: FOOTER_SIZE })]
    }));

    return new Document({
        sections: [{
            properties: {
                page: {
                    margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, header: 250, footer: 300 }
                }
            },
            headers: { default: header },
            footers: { default: footer },
            children: body
        }]
    });
}

export async function baixarFichaDocx(formEl) {
    try {
        const docxLib = window.docx;
        if (!docxLib) {
            return { ok: false, error: 'A biblioteca docx não carregou.' };
        }

        const logoBytes = await fetchLogoBytes();
        const doc = buildDocument(docxLib, formEl, logoBytes);
        const blob = await docxLib.Packer.toBlob(doc);

        const nomeInput = formEl.querySelector('[name="nome"]');
        const nomeNormalizado = nomeInput && nomeInput.value.trim()
            ? normalizarNomeFicheiro(nomeInput.value.trim())
            : String(Date.now());
        const filename = `Ficha-Inscricao-ACIMHA-${nomeNormalizado}.docx`;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);

        return { ok: true, filename, blob };
    } catch (error) {
        console.error(error);
        return { ok: false, error };
    }
}
