import nodemailer from 'nodemailer';
import { getInscricaoTokensStore } from './lib/blobs.mjs';

// Envio real por SMTP. Credenciais vêm sempre de variáveis de ambiente do
// Netlify (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM) — nunca
// hardcoded nem guardadas neste repositório.
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8MB, mesmo limite do upload-document.mjs

const CMD_URL = 'https://cmd.autenticacao.gov.pt/Ama.Authentication.Frontend/Processes/DigitalSignature/DigitalSignatureIntro.aspx';

function buildEmailHtml({ nome, retomarUrl }) {
    const saudacao = nome ? `Olá, ${nome}.` : 'Olá.';
    return `<!doctype html>
<html lang="pt">
  <body style="margin:0;padding:0;background:#F2EFE7;font-family:Georgia,'Times New Roman',serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2EFE7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border:1px solid #C8C2B0;">
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0 0 16px;font-size:16px;">${saudacao}</p>
                <p style="margin:0 0 16px;font-size:16px;">Segue em anexo a sua ficha de inscrição na ACIMHA, já com os seus dados preenchidos.</p>
                <p style="margin:0 0 8px;font-size:16px;">Para concluir a inscrição, escolha uma das duas formas de assinar o documento antes de o validar oficialmente:</p>
                <ol style="margin:0 0 16px;padding-left:20px;font-size:15px;">
                  <li style="margin-bottom:8px;"><strong>Chave Móvel Digital:</strong> abra o ficheiro em anexo no Word ou LibreOffice, exporte-o ou imprima-o como PDF e carregue esse PDF no <a href="${CMD_URL}">site oficial da Chave Móvel Digital</a> para o assinar. É necessário ter a Chave Móvel Digital ativa; o tamanho máximo aceite pela ferramenta é 3MB — este documento é muito menor, por isso não haverá problema.</li>
                  <li><strong>Assinatura manual:</strong> imprima o documento, assine-o à mão e digitalize-o (ou fotografe-o) num único ficheiro PDF.</li>
                </ol>
                <p style="margin:0 0 24px;font-size:16px;">Depois de assinado, por uma via ou outra, carregue o PDF assinado através do botão abaixo:</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                  <tr>
                    <td style="background:#8A1C1C;">
                      <a href="${retomarUrl}" style="display:inline-block;padding:16px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">Continuar a assinatura →</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:13px;color:#595959;">Este link é válido por 30 dias. Se não foi você quem submeteu esta inscrição, ignore este e-mail ou contacte-nos em acimha.geral@gmail.com.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

let transporter = null;
function getTransporter() {
    if (transporter) return transporter;
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
    transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    return transporter;
}

export default async (req) => {
    let body;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado JSON.' }, { status: 400 });
    }

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';
    const filename = typeof body.filename === 'string' ? body.filename.trim() : 'Ficha-Inscricao-ACIMHA.docx';
    const docxBase64 = typeof body.docxBase64 === 'string' ? body.docxBase64 : '';

    if (!email) {
        return Response.json({ error: 'email em falta.' }, { status: 400 });
    }
    if (!token) {
        return Response.json({ error: 'token em falta.' }, { status: 400 });
    }
    if (!docxBase64) {
        return Response.json({ error: 'documento em falta.' }, { status: 400 });
    }

    let attachmentBuffer;
    try {
        attachmentBuffer = Buffer.from(docxBase64, 'base64');
    } catch {
        return Response.json({ error: 'documento inválido.' }, { status: 400 });
    }
    if (attachmentBuffer.length === 0 || attachmentBuffer.length > MAX_ATTACHMENT_BYTES) {
        return Response.json({ error: 'documento com tamanho inválido.' }, { status: 400 });
    }

    try {
        const store = getInscricaoTokensStore();
        const record = await store.get(token, { type: 'json' });
        if (!record || record.email !== email) {
            return Response.json({ error: 'Token inválido para este email.' }, { status: 400 });
        }
    } catch {
        return Response.json({ error: 'Falha ao validar o token.' }, { status: 502 });
    }

    const smtp = getTransporter();
    if (!smtp) {
        return Response.json(
            {
                ok: false,
                sent: false,
                stub: true,
                error: 'Envio automático por email ainda não está ligado — falta configuração SMTP.',
            },
            { status: 501 }
        );
    }

    const origin = new URL(req.url).origin;
    const retomarUrl = `${origin}/assinatura?token=${token}`;
    const html = buildEmailHtml({ nome, retomarUrl });

    try {
        await smtp.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'A sua ficha de inscrição na ACIMHA',
            html,
            attachments: [{ filename, content: attachmentBuffer }],
        });
    } catch (error) {
        console.error('Falha ao enviar email de inscrição:', error);
        return Response.json({ ok: false, sent: false, error: 'Falha ao enviar o email.' }, { status: 502 });
    }

    return Response.json({ ok: true, sent: true });
};
