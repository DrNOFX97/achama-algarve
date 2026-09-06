const ASSOCIACAO_NOME = 'ACIMHA';
const ASSOCIACAO_NOME_COMPLETO = 'Associação Cívica de Munícipes e Habitação do Algarve';
const ASSOCIACAO_NIPC = '519597265';
// Absoluto — este módulo é importado tanto a partir de "/" (inscricao-modal.js)
// como de "/admin/" (admin.js), onde um caminho relativo apontaria para
// "/admin/assets/..." e falharia.
const LOGO_PATH = '/assets/images/ACIMHA.png';

// Tamanhos em meios-pontos (docx.js). Documento tem de caber numa única
// página A4 — por isso o corpo compacto e a declaração/quotas mais pequenas.
const TITLE_SIZE = 34;   // 17pt (usado só como referência; o título no masthead usa 28 — ver mais abaixo)
const SECTION_SIZE = 22; // 11pt
const BODY_SIZE = 20;    // 10pt
const SMALL_SIZE = 18;   // 9pt — declaração e quotas
const FOOTER_SIZE = 16;  // 8pt

const SINGLE_LINE = { line: 240, lineRule: 'auto' };

// Paleta institucional: azul-ardósia profundo (confiança, civismo) + areia
// quente (calor humano).
const ACCENT = '1F3B4D';        // azul-ardósia — títulos de secção, linha do masthead
const ACCENT_DARK = '152935';   // variante mais escura — texto de ênfase forte
const SAND_LINE = 'C8C2B0';     // linha fina divisória do rodapé
const SAND_TINT = 'F3F1EA';     // fundo suave para zebra striping e pill selecionada
const TEXT_BODY = '2B2B2B';     // corpo de texto, ligeiramente mais suave que preto puro

const TIPO_ASSOCIADO_OPTIONS = [
    { value: 'civico', label: 'Sócio Cívico' },
    { value: 'habitacional', label: 'Sócio Habitacional' }
];

const MEIO_COMUNICACAO_OPTIONS = [
    { value: 'email', label: 'E-mail' },
    { value: 'carta', label: 'Carta / correio postal' },
    { value: 'telemovel', label: 'Telemóvel para contactos informais' }
];

// `dados` é um objeto simples { tipo_associado, nome, ..., aceita_estatutos,
// autoriza_dados, local, data_inscricao } — as mesmas chaves usadas pelos
// campos/checkboxes do formulário de inscrição (ver index.html) e pelo
// painel admin (list-inscricoes.mjs), para o documento poder ser gerado
// tanto a partir do formulário ao vivo (inscricao-modal.js) como a partir
// de uma inscrição já submetida (admin.js, reenvio de email).
function getFieldValue(dados, name) {
    return (dados[name] ?? '').toString().trim();
}

function getCheckedValue(dados, name) {
    return dados[name] || null;
}

function isChecked(dados, name) {
    return !!dados[name];
}

// Converte um <form> ao vivo no objeto de dados simples que buildDocument
// espera — usado só pelo fluxo público (inscricao-modal.js); o painel admin
// já tem os dados como objeto (vindos de list-inscricoes.mjs).
export function formDataParaDados(formEl) {
    const formData = new FormData(formEl);
    return {
        tipo_associado: formData.get('tipo_associado') || null,
        nome: formData.get('nome') || '',
        data_nascimento: formData.get('data_nascimento') || '',
        nif: formData.get('nif') || '',
        cc_bi: formData.get('cc_bi') || '',
        morada: formData.get('morada') || '',
        codigo_postal: formData.get('codigo_postal') || '',
        localidade: formData.get('localidade') || '',
        concelho: formData.get('concelho') || '',
        distrito: formData.get('distrito') || '',
        telefone: formData.get('telefone') || '',
        email: formData.get('email') || '',
        profissao: formData.get('profissao') || '',
        meio_comunicacao: formData.get('meio_comunicacao') || null,
        aceita_estatutos: formEl.querySelector('#ins-estatutos')?.checked || false,
        autoriza_dados: formEl.querySelector('#ins-rgpd')?.checked || false,
        local: formData.get('local') || '',
        data_inscricao: formData.get('data_inscricao') || '',
    };
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

function arrayBufferToDataUrl(buffer, mime) {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return `data:${mime};base64,${btoa(binary)}`;
}

const DOCX_LIB_URL = 'https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js';
let docxLoadPromise = null;

// Carregada só quando o utilizador pede o download da ficha (em vez de
// bloquear o carregamento de todas as páginas com ~1MB de biblioteca que a
// maioria das visitas nunca usa — ver css/main.css e index.html).
function loadDocxLib() {
    if (window.docx) return Promise.resolve(window.docx);
    if (!docxLoadPromise) {
        docxLoadPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = DOCX_LIB_URL;
            script.onload = () => resolve(window.docx);
            script.onerror = () => {
                docxLoadPromise = null;
                reject(new Error('Falha ao carregar a biblioteca docx.'));
            };
            document.head.appendChild(script);
        });
    }
    return docxLoadPromise;
}

// A ficha enviada por email tem de ser um PDF pronto a assinar (Chave Móvel
// Digital exige PDF), não o .docx — ver gerarFichaPdf. Usa pdfmake em vez de
// converter o .docx (não há motor de conversão fiável disponível numa
// função Netlify serverless); carregada sob pedido tal como o `docx`, acima.
const PDFMAKE_JS_URL = 'https://cdn.jsdelivr.net/npm/pdfmake@0.3.11/build/pdfmake.min.js';
const PDFMAKE_FONTS_URL = 'https://cdn.jsdelivr.net/npm/pdfmake@0.3.11/build/vfs_fonts.js';
let pdfMakeLoadPromise = null;
// vfs_fonts.js não define uma propriedade pública "carregado" em pdfMake —
// só chama pdfMake.addVirtualFileSystem(...) internamente — por isso o
// sinalizador de "já pronto" é nosso, não algo que se possa inspecionar em
// window.pdfMake depois de carregado.
let pdfMakeReady = false;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Falha ao carregar ${src}.`));
        document.head.appendChild(script);
    });
}

function loadPdfMakeLib() {
    if (pdfMakeReady) return Promise.resolve(window.pdfMake);
    if (!pdfMakeLoadPromise) {
        pdfMakeLoadPromise = loadScript(PDFMAKE_JS_URL)
            .then(() => loadScript(PDFMAKE_FONTS_URL))
            .then(() => {
                pdfMakeReady = true;
                return window.pdfMake;
            })
            .catch((error) => {
                pdfMakeLoadPromise = null;
                throw error;
            });
    }
    return pdfMakeLoadPromise;
}

function buildDocument(docx, dados, logoBytes) {
    const {
        Document, Paragraph, TextRun, Table, TableRow, TableCell, Footer,
        AlignmentType, BorderStyle, WidthType, ImageRun, HeadingLevel, VerticalAlign
    } = docx;

    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const noBorders = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
    const THICK_LINE = { style: BorderStyle.SINGLE, size: 24, color: ACCENT };
    const ACCENT_BORDER = { style: BorderStyle.SINGLE, size: 8, color: ACCENT };
    const CELL_MARGINS = { top: 20, bottom: 20, left: 0, right: 0 };

    function fieldRow(label, value, zebra) {
        const shading = zebra ? { fill: SAND_TINT } : undefined;
        const rowMargins = { ...CELL_MARGINS, top: 12, bottom: 12, left: 60 };
        return new TableRow({
            children: [
                new TableCell({
                    width: { size: 32, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    shading,
                    margins: { ...rowMargins, right: 80 },
                    children: [new Paragraph({
                        spacing: SINGLE_LINE,
                        children: [new TextRun({ text: `${label}`, bold: true, font: 'Cambria', size: BODY_SIZE, color: ACCENT })]
                    })]
                }),
                new TableCell({
                    width: { size: 68, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    shading,
                    margins: { ...rowMargins, right: 60 },
                    children: [new Paragraph({
                        spacing: SINGLE_LINE,
                        children: [new TextRun({ text: value || '—', font: 'Calibri', size: BODY_SIZE, color: TEXT_BODY })]
                    })]
                })
            ]
        });
    }

    function fieldTable(rows) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: rows.map(([label, value], i) => fieldRow(label, value, i % 2 === 1))
        });
    }

    // Local e Data lado a lado, na mesma linha — usado só na secção de
    // assinatura (em vez de uma linha por campo).
    function fieldRowPair(label1, value1, label2, value2) {
        const rowMargins = { ...CELL_MARGINS, top: 12, bottom: 12, left: 60 };
        function cell(label, value, width, rightPad) {
            return new TableCell({
                width: { size: width, type: WidthType.PERCENTAGE },
                borders: noBorders,
                margins: { ...rowMargins, right: rightPad },
                children: [new Paragraph({
                    spacing: SINGLE_LINE,
                    children: [
                        new TextRun({ text: `${label}: `, bold: true, font: 'Cambria', size: BODY_SIZE, color: ACCENT }),
                        new TextRun({ text: value || '—', font: 'Calibri', size: BODY_SIZE, color: TEXT_BODY })
                    ]
                })]
            });
        }
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [new TableRow({
                children: [
                    cell(label1, value1, 50, 80),
                    cell(label2, value2, 50, 60)
                ]
            })]
        });
    }

    // Divisória de secção em dois parágrafos: a linha separadora seguida
    // de um espaço equivalente a uma linha em branco (via "after" da
    // própria linha), e só depois o subtítulo.
    function sectionHeading(number, title) {
        return [
            new Paragraph({
                border: { top: ACCENT_BORDER },
                spacing: { before: 210, after: 0 },
                children: [new TextRun({ text: '', size: 2 })]
            }),
            new Paragraph({
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 0, after: 85, ...SINGLE_LINE },
                children: [new TextRun({ text: `${number}.  ${title}`, bold: true, font: 'Cambria', size: SECTION_SIZE, color: ACCENT })]
            })
        ];
    }

    function bodyText(text, opts = {}) {
        return new Paragraph({
            spacing: { after: 10, ...SINGLE_LINE },
            children: [new TextRun({ text, font: 'Calibri', size: SMALL_SIZE, color: TEXT_BODY, ...opts })]
        });
    }

    // Opções de categoria/comunicação como "pill": a selecionada ganha
    // fundo areia e moldura no azul institucional; as restantes ficam
    // discretas em cinza claro, para o olhar ir direto à escolha feita.
    function optionPill(opt, selectedValue) {
        const checked = opt.value === selectedValue;
        const border = checked
            ? { style: BorderStyle.SINGLE, size: 6, color: ACCENT }
            : { style: BorderStyle.SINGLE, size: 4, color: 'DDDAD0' };
        return new TableCell({
            width: { size: 0, type: WidthType.AUTO },
            borders: { top: border, bottom: border, left: border, right: border },
            shading: checked ? { fill: SAND_TINT } : undefined,
            verticalAlign: VerticalAlign.CENTER,
            margins: { top: 60, bottom: 60, left: 120, right: 120 },
            children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: SINGLE_LINE,
                children: [
                    new TextRun({ text: checked ? '☑  ' : '☐  ', font: 'Calibri', size: BODY_SIZE, bold: checked, color: checked ? ACCENT_DARK : '8A8577' }),
                    new TextRun({ text: opt.label, font: 'Calibri', size: BODY_SIZE, bold: checked, color: checked ? ACCENT_DARK : '8A8577' })
                ]
            })]
        });
    }

    function optionRow(options, selectedValue) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: options.map(() => Math.floor(9638 / options.length)),
            rows: [new TableRow({
                children: options.map(opt => optionPill(opt, selectedValue))
            })]
        });
    }

    const tipoAssociado = getCheckedValue(dados, 'tipo_associado');
    const meioComunicacao = getCheckedValue(dados, 'meio_comunicacao');
    const localidadeFormatada = formatLocalidade(getFieldValue(dados, 'localidade'), getFieldValue(dados, 'concelho'));

    const identificacaoRows = [
        ['Nome completo', getFieldValue(dados, 'nome')],
        ['Data de nascimento', getFieldValue(dados, 'data_nascimento')],
        ['NIF', getFieldValue(dados, 'nif')],
        ['N.º CC/BI', getFieldValue(dados, 'cc_bi')],
        ['Morada', getFieldValue(dados, 'morada')],
        ['Código Postal', getFieldValue(dados, 'codigo_postal')],
        ['Localidade', localidadeFormatada],
        ['Telemóvel', getFieldValue(dados, 'telefone')],
        ['E-mail', getFieldValue(dados, 'email')],
        ['Profissão', getFieldValue(dados, 'profissao')]
    ];

    const local = getFieldValue(dados, 'local');
    const dataInscricao = getFieldValue(dados, 'data_inscricao');

    // Masthead: logótipo à esquerda, nome + título da ficha à direita, na
    // mesma linha — substitui o antigo cabeçalho de página com o logo sozinho.
    const masthead = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({
            children: [
                new TableCell({
                    width: { size: 12, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: { ...CELL_MARGINS, right: 60 },
                    children: [new Paragraph({
                        children: [new ImageRun({
                            data: logoBytes,
                            transformation: { width: 66, height: 50 },
                            type: 'png'
                        })]
                    })]
                }),
                new TableCell({
                    width: { size: 88, type: WidthType.PERCENTAGE },
                    borders: noBorders,
                    verticalAlign: VerticalAlign.CENTER,
                    margins: CELL_MARGINS,
                    children: [
                        new Paragraph({
                            spacing: { after: 20 },
                            children: [new TextRun({ text: ASSOCIACAO_NOME_COMPLETO.toUpperCase(), font: 'Calibri', size: FOOTER_SIZE, color: '8A8577', characterSpacing: 12 })]
                        }),
                        new Paragraph({
                            spacing: { after: 0 },
                            children: [new TextRun({ text: 'Proposta / Ficha de Inscrição de Associado', bold: true, font: 'Cambria', size: 28, color: ACCENT_DARK })]
                        })
                    ]
                })
            ]
        })]
    });

    const mastheadDivider = new Paragraph({
        border: { bottom: THICK_LINE },
        spacing: { before: 90, after: 100 },
        children: [new TextRun({ text: '', size: 2 })]
    });

    const footer = new Footer({
        children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: SAND_LINE } },
            spacing: { before: 60, ...SINGLE_LINE },
            children: [new TextRun({ text: `${ASSOCIACAO_NOME} · NIPC ${ASSOCIACAO_NIPC}`, font: 'Calibri', size: FOOTER_SIZE, color: ACCENT })]
        })]
    });

    const body = [
        masthead,
        mastheadDivider,
        new Paragraph({
            spacing: { after: 40, ...SINGLE_LINE },
            children: [new TextRun({ text: 'CATEGORIA PRETENDIDA', bold: true, font: 'Cambria', size: SECTION_SIZE, color: ACCENT })]
        }),
        optionRow(TIPO_ASSOCIADO_OPTIONS, tipoAssociado),

        ...sectionHeading(1, 'IDENTIFICAÇÃO DO CANDIDATO'),
        fieldTable(identificacaoRows),

        ...sectionHeading(2, 'CONTACTO E COMUNICAÇÕES'),
        new Paragraph({
            spacing: { after: 25, ...SINGLE_LINE },
            children: [new TextRun({ text: 'Indique o meio preferencial para comunicações da Associação:', font: 'Calibri', size: BODY_SIZE })]
        }),
        optionRow(MEIO_COMUNICACAO_OPTIONS, meioComunicacao),

        ...sectionHeading(3, 'DECLARAÇÃO DO CANDIDATO'),
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
        spacing: { after: 8, ...SINGLE_LINE },
        children: [new TextRun({ text, font: 'Calibri', size: SMALL_SIZE })]
    })));

    body.push(new Paragraph({
        spacing: { before: 40, after: 12, ...SINGLE_LINE },
        children: [
            new TextRun({ text: isChecked(dados, 'aceita_estatutos') ? '☑ ' : '☐ ', bold: true, size: BODY_SIZE }),
            new TextRun({ text: 'Aceitação dos estatutos e regulamentos internos', size: BODY_SIZE })
        ]
    }));
    body.push(new Paragraph({
        spacing: { after: 12, ...SINGLE_LINE },
        children: [
            new TextRun({ text: isChecked(dados, 'autoriza_dados') ? '☑ ' : '☐ ', bold: true, size: BODY_SIZE }),
            new TextRun({ text: 'Autorização de tratamento de dados pessoais (RGPD)', size: BODY_SIZE })
        ]
    }));

    body.push(...sectionHeading(4, 'QUOTAS E JOIA'));
    body.push(bodyText('Quota mensal: €5,00 (cinco euros), para os associados sujeitos a quotização.'));
    body.push(bodyText('Sócio Cívico: sem joia de inscrição.'));
    body.push(bodyText('Sócio Habitacional: joia de inscrição de €100,00 (cem euros), sem prejuízo das regras e obrigações específicas previstas para os programas habitacionais.'));
    body.push(bodyText('Pagamento de quotas: no primeiro ano recomenda-se, sem caráter obrigatório, o pagamento antecipado de 12 meses; nos anos seguintes recomenda-se o pagamento antecipado de pelo menos 6 meses, podendo o associado optar por outra periodicidade desde que mantenha as obrigações regularizadas.'));

    body.push(...sectionHeading(5, 'ASSINATURA'));
    body.push(fieldRowPair('Local', local, 'Data', dataInscricao));
    body.push(new Paragraph({
        spacing: { before: 470, ...SINGLE_LINE },
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
                    margin: { top: 650, bottom: 850, left: 1134, right: 1134, header: 250, footer: 300 }
                }
            },
            footers: { default: footer },
            children: body
        }]
    });
}

// Tamanhos em pt (pdfmake usa pt diretamente, ao contrário do docx que usa
// meios-pontos) — mesma escala do documento acima, para que a versão em PDF
// fique visualmente equivalente à ficha em .docx.
const PDF_MARGIN_X = 56.7; // 1134 twips, igual ao docx
const PDF_SECTION_SIZE = 11;
const PDF_BODY_SIZE = 10;
const PDF_SMALL_SIZE = 9;
const PDF_FOOTER_SIZE = 8;
const PDF_TITLE_SIZE = 14;

function hexColor(hex) {
    return `#${hex}`;
}

// Constrói o mesmo conteúdo de buildDocument, mas como docDefinition do
// pdfmake em vez de Document do docx — as duas bibliotecas não partilham
// um formato de documento comum, por isso o layout tem de ser reescrito
// para cada uma; os dados e as regras de negócio (getFieldValue,
// formatLocalidade, etc.) são exatamente os mesmos, acima.
function buildPdfDocDefinition(dados, logoDataUrl) {
    const contentWidth = 595.28 - PDF_MARGIN_X * 2; // A4 útil

    function hr(color, width, marginTop, marginBottom) {
        return {
            canvas: [{ type: 'line', x1: 0, y1: 0, x2: contentWidth, y2: 0, lineWidth: width, lineColor: hexColor(color) }],
            margin: [0, marginTop, 0, marginBottom]
        };
    }

    function checkboxGlyph(checked, size = 9) {
        const shapes = [{ type: 'rect', x: 0, y: 0, w: size, h: size, r: 1, lineColor: hexColor(checked ? ACCENT_DARK : 'DDDAD0'), lineWidth: 1 }];
        if (checked) {
            shapes.push({
                type: 'polyline', lineWidth: 1.4, lineColor: hexColor(ACCENT_DARK), closePath: false,
                points: [{ x: 1.5, y: size / 2 }, { x: size / 2 - 0.5, y: size - 2 }, { x: size - 1.5, y: 1.5 }]
            });
        }
        return { width: size + 2, stack: [{ canvas: shapes }] };
    }

    function pillCell(opt, selectedValue) {
        const checked = opt.value === selectedValue;
        const borderColor = hexColor(checked ? ACCENT : 'DDDAD0');
        const textColor = hexColor(checked ? ACCENT_DARK : '8A8577');
        return {
            table: {
                widths: ['*'],
                body: [[{
                    border: [true, true, true, true],
                    fillColor: checked ? hexColor(SAND_TINT) : undefined,
                    margin: [8, 5, 8, 5],
                    columns: [
                        checkboxGlyph(checked, 9),
                        { text: opt.label, bold: checked, color: textColor, fontSize: PDF_BODY_SIZE, margin: [4, 0, 0, 0] }
                    ]
                }]]
            },
            layout: {
                hLineColor: () => borderColor,
                vLineColor: () => borderColor,
                hLineWidth: () => checked ? 1.2 : 0.8,
                vLineWidth: () => checked ? 1.2 : 0.8,
            }
        };
    }

    function optionRow(options, selectedValue) {
        return { columns: options.map(opt => pillCell(opt, selectedValue)), columnGap: 8, margin: [0, 0, 0, 5] };
    }

    function sectionHeading(number, title) {
        return {
            stack: [
                hr(ACCENT, 1.3, 6, 3),
                { text: `${number}.  ${title}`, bold: true, color: hexColor(ACCENT), fontSize: PDF_SECTION_SIZE, margin: [0, 0, 0, 3] }
            ]
        };
    }

    function fieldTable(rows) {
        return {
            table: {
                widths: ['32%', '68%'],
                body: rows.map(([label, value]) => ([
                    { text: label, bold: true, color: hexColor(ACCENT), fontSize: PDF_BODY_SIZE },
                    { text: value || '—', color: hexColor(TEXT_BODY), fontSize: PDF_BODY_SIZE }
                ]))
            },
            layout: {
                fillColor: (rowIndex) => rowIndex % 2 === 1 ? hexColor(SAND_TINT) : null,
                hLineWidth: () => 0,
                vLineWidth: () => 0,
                paddingLeft: (i) => i === 0 ? 8 : 6,
                paddingRight: () => 6,
                paddingTop: () => 2,
                paddingBottom: () => 2,
            },
            margin: [0, 0, 0, 2]
        };
    }

    function fieldRowPair(label1, value1, label2, value2) {
        return {
            columns: [
                { text: [{ text: `${label1}: `, bold: true, color: hexColor(ACCENT), fontSize: PDF_BODY_SIZE }, { text: value1 || '—', color: hexColor(TEXT_BODY), fontSize: PDF_BODY_SIZE }] },
                { text: [{ text: `${label2}: `, bold: true, color: hexColor(ACCENT), fontSize: PDF_BODY_SIZE }, { text: value2 || '—', color: hexColor(TEXT_BODY), fontSize: PDF_BODY_SIZE }] }
            ],
            margin: [0, 0, 0, 4]
        };
    }

    function checkboxLine(checked, label) {
        return {
            columns: [checkboxGlyph(checked, 10), { text: label, fontSize: PDF_BODY_SIZE, margin: [4, 0, 0, 0] }],
            margin: [0, 1, 0, 1]
        };
    }

    const tipoAssociado = getCheckedValue(dados, 'tipo_associado');
    const meioComunicacao = getCheckedValue(dados, 'meio_comunicacao');
    const localidadeFormatada = formatLocalidade(getFieldValue(dados, 'localidade'), getFieldValue(dados, 'concelho'));

    const identificacaoRows = [
        ['Nome completo', getFieldValue(dados, 'nome')],
        ['Data de nascimento', getFieldValue(dados, 'data_nascimento')],
        ['NIF', getFieldValue(dados, 'nif')],
        ['N.º CC/BI', getFieldValue(dados, 'cc_bi')],
        ['Morada', getFieldValue(dados, 'morada')],
        ['Código Postal', getFieldValue(dados, 'codigo_postal')],
        ['Localidade', localidadeFormatada],
        ['Telemóvel', getFieldValue(dados, 'telefone')],
        ['E-mail', getFieldValue(dados, 'email')],
        ['Profissão', getFieldValue(dados, 'profissao')]
    ];

    const local = getFieldValue(dados, 'local');
    const dataInscricao = getFieldValue(dados, 'data_inscricao');

    const content = [
        {
            columns: [
                { image: logoDataUrl, fit: [50, 38], width: 54 },
                {
                    stack: [
                        { text: ASSOCIACAO_NOME_COMPLETO.toUpperCase(), color: hexColor('8A8577'), fontSize: PDF_FOOTER_SIZE, margin: [0, 0, 0, 2] },
                        { text: 'Proposta / Ficha de Inscrição de Associado', bold: true, color: hexColor(ACCENT_DARK), fontSize: PDF_TITLE_SIZE }
                    ], width: '*', margin: [8, 2, 0, 0]
                }
            ]
        },
        hr(ACCENT, 2, 4, 6),

        { text: 'CATEGORIA PRETENDIDA', bold: true, color: hexColor(ACCENT), fontSize: PDF_SECTION_SIZE, margin: [0, 0, 0, 3] },
        optionRow(TIPO_ASSOCIADO_OPTIONS, tipoAssociado),

        sectionHeading(1, 'IDENTIFICAÇÃO DO CANDIDATO'),
        fieldTable(identificacaoRows),

        sectionHeading(2, 'CONTACTO E COMUNICAÇÕES'),
        { text: 'Indique o meio preferencial para comunicações da Associação:', fontSize: PDF_BODY_SIZE, margin: [0, 0, 0, 3] },
        optionRow(MEIO_COMUNICACAO_OPTIONS, meioComunicacao),

        sectionHeading(3, 'DECLARAÇÃO DO CANDIDATO'),
        { text: `Declaro que solicito a minha admissão na ${ASSOCIACAO_NOME} — ${ASSOCIACAO_NOME_COMPLETO}, na categoria acima indicada, e que:`, bold: true, fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 4] },
        {
            ul: [
                'tomei conhecimento de que a admissão como Sócio Cívico ou Sócio Habitacional depende de deliberação da Direção;',
                'comprometo-me, após a admissão, a respeitar os Estatutos, regulamentos e deliberações válidas dos órgãos sociais da ACIMHA;',
                'comprometo-me a contribuir para os fins da Associação, preservar o seu bom nome e cumprir as obrigações associativas que me sejam aplicáveis;',
                'autorizo a utilização dos dados fornecidos nesta ficha para efeitos de análise da candidatura, gestão da relação associativa, comunicações institucionais e cumprimento das obrigações legais da Associação, nos termos da legislação aplicável.'
            ],
            fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 4]
        },

        checkboxLine(isChecked(dados, 'aceita_estatutos'), 'Aceitação dos estatutos e regulamentos internos'),
        checkboxLine(isChecked(dados, 'autoriza_dados'), 'Autorização de tratamento de dados pessoais (RGPD)'),

        sectionHeading(4, 'QUOTAS E JOIA'),
        { text: 'Quota mensal: €5,00 (cinco euros), para os associados sujeitos a quotização.', fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 1] },
        { text: 'Sócio Cívico: sem joia de inscrição.', fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 1] },
        { text: 'Sócio Habitacional: joia de inscrição de €100,00 (cem euros), sem prejuízo das regras e obrigações específicas previstas para os programas habitacionais.', fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 1] },
        { text: 'Pagamento de quotas: no primeiro ano recomenda-se, sem caráter obrigatório, o pagamento antecipado de 12 meses; nos anos seguintes recomenda-se o pagamento antecipado de pelo menos 6 meses, podendo o associado optar por outra periodicidade desde que mantenha as obrigações regularizadas.', fontSize: PDF_SMALL_SIZE, margin: [0, 0, 0, 1] },

        sectionHeading(5, 'ASSINATURA'),
        fieldRowPair('Local', local, 'Data', dataInscricao),
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.75, lineColor: '#000000' }], margin: [0, 34, 0, 3] },
        { text: 'Assinatura do candidato', italics: true, fontSize: PDF_FOOTER_SIZE, margin: [0, 0, 0, 0] },
    ];

    return {
        pageSize: 'A4',
        pageMargins: [PDF_MARGIN_X, 24, PDF_MARGIN_X, 46],
        defaultStyle: { font: 'Roboto' },
        content,
        footer() {
            return {
                margin: [PDF_MARGIN_X, 6, PDF_MARGIN_X, 0],
                stack: [
                    hr(SAND_LINE, 0.75, 0, 4),
                    { text: `${ASSOCIACAO_NOME} · NIPC ${ASSOCIACAO_NIPC}`, alignment: 'center', fontSize: PDF_FOOTER_SIZE, color: hexColor(ACCENT) }
                ]
            };
        }
    };
}

// Gera o .docx sem o descarregar — usado tanto pelo fluxo público
// (baixarFichaDocx, abaixo) como pelo painel admin, que só precisa do blob
// para o enviar por email (admin.js, "Enviar documento para assinar").
export async function gerarFichaDocx(dados) {
    try {
        let docxLib;
        try {
            docxLib = await loadDocxLib();
        } catch (e) {
            console.error(e);
            return { ok: false, error: 'A biblioteca docx não carregou.' };
        }
        if (!docxLib) {
            return { ok: false, error: 'A biblioteca docx não carregou.' };
        }

        const logoBytes = await fetchLogoBytes();
        const doc = buildDocument(docxLib, dados, logoBytes);
        const blob = await docxLib.Packer.toBlob(doc);

        const nome = (dados.nome || '').trim();
        const nomeNormalizado = nome ? normalizarNomeFicheiro(nome) : String(Date.now());
        const filename = `Ficha-Inscricao-ACIMHA-${nomeNormalizado}.docx`;

        return { ok: true, filename, blob };
    } catch (error) {
        console.error(error);
        return { ok: false, error };
    }
}

export async function baixarFichaDocx(dados) {
    const result = await gerarFichaDocx(dados);
    if (!result.ok) return result;

    const { filename, blob } = result;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    return result;
}

// Gera o PDF (pronto a assinar, ex.: via Chave Móvel Digital) sem o
// descarregar — é o ficheiro enviado por email, tanto pelo fluxo público
// (inscricao-modal.js) como pelo painel admin (admin.js). O download local
// da ficha continua em .docx (baixarFichaDocx, acima) — só o anexo do email
// precisa de ser PDF.
export async function gerarFichaPdf(dados) {
    try {
        let pdfMake;
        try {
            pdfMake = await loadPdfMakeLib();
        } catch (e) {
            console.error(e);
            return { ok: false, error: 'A biblioteca pdfmake não carregou.' };
        }
        if (!pdfMake) {
            return { ok: false, error: 'A biblioteca pdfmake não carregou.' };
        }

        const logoBytes = await fetchLogoBytes();
        const logoDataUrl = arrayBufferToDataUrl(logoBytes, 'image/png');
        const docDefinition = buildPdfDocDefinition(dados, logoDataUrl);
        const blob = await pdfMake.createPdf(docDefinition).getBlob();

        const nome = (dados.nome || '').trim();
        const nomeNormalizado = nome ? normalizarNomeFicheiro(nome) : String(Date.now());
        const filename = `Ficha-Inscricao-ACIMHA-${nomeNormalizado}.pdf`;

        return { ok: true, filename, blob };
    } catch (error) {
        console.error(error);
        return { ok: false, error };
    }
}
