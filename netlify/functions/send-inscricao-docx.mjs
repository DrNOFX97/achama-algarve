import { getInscricaoTokensStore } from './lib/blobs.mjs';

// STUB — estrutura pronta, envio real por SMTP ainda não implementado.
//
// Esta função NÃO está ligada ao fluxo público do site: por agora,
// inscricao-modal.js faz download local do .docx e mostra o link de retomar
// no próprio ecrã (ver Tarefa 2 revista). Fica pronta para ligar assim que
// tivermos as credenciais SMTP do cliente — falta decidir e confirmar
// (Gmail app password de acimha.geral@gmail.com, ou credenciais SMTP de
// geral@acimha.pt via securemail.pro) e configurar como variável de
// ambiente (nunca hardcoded). Ver histórico da conversa / Notion para
// contexto completo desta decisão.
//
// TODO: ligar SMTP quando tivermos credenciais do cliente, por exemplo:
//   import nodemailer from 'nodemailer';
//   const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT || 587),
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//   });
//   await transporter.sendMail({
//       from: process.env.SMTP_FROM,
//       to: email,
//       subject: 'A sua ficha de inscrição na ACIMHA',
//       html,
//       attachments: [{ filename, content: Buffer.from(docxBase64, 'base64') }],
//   });

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
                <p style="margin:0 0 24px;font-size:16px;">Para concluir a inscrição, assine o documento — com a Chave Móvel Digital, ou imprimindo e assinando à mão — e carregue o ficheiro assinado através do botão abaixo:</p>
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

    if (!email) {
        return Response.json({ error: 'email em falta.' }, { status: 400 });
    }
    if (!token) {
        return Response.json({ error: 'token em falta.' }, { status: 400 });
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

    const origin = new URL(req.url).origin;
    const retomarUrl = `${origin}/assinatura?token=${token}`;
    const html = buildEmailHtml({ nome, retomarUrl });

    return Response.json(
        {
            ok: false,
            sent: false,
            stub: true,
            error: 'Envio automático por email ainda não está ligado — falta configuração SMTP.',
            preview: { retomarUrl, htmlLength: html.length },
        },
        { status: 501 }
    );
};
