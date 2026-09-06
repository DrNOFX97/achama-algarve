import nodemailer from 'nodemailer';
import { getInscricaoTokensStore } from './lib/blobs.mjs';
import { findFormIdByName, listSubmissions } from './lib/netlify-api.mjs';

// Chamada por inscricao-signature.js logo a seguir ao upload do PDF assinado
// (submissão nativa do Netlify Forms) ter sucesso. Não faz parte do caminho
// crítico: se isto falhar, a inscrição já está gravada no Netlify Forms — só
// os avisos por email é que se perdem. Por isso o chamador trata isto como
// "dispara e esquece" e nunca mostra erro ao associado.
const ADMIN_EMAIL = 'geral@acimha.pt';

const CATEGORIA_LABELS = {
    civico: 'Sócio Cívico',
    habitacional: 'Sócio Habitacional',
};

function buildClienteEmailHtml({ nome }) {
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
                <p style="margin:0 0 16px;font-size:16px;">Obrigado — recebemos o seu documento de inscrição assinado na ACIMHA.</p>
                <p style="margin:0 0 16px;font-size:16px;">O seu processo fica agora pendente de aprovação pela Direção. Entraremos em contacto por e-mail nas próximas 48 horas para confirmar a sua inscrição.</p>
                <p style="margin:0;font-size:13px;color:#595959;">Se tiver dúvidas, contacte-nos em geral@acimha.pt.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildAdminEmailHtml({ nome, email, categoriaLabel, telefone, adminUrl }) {
    return `<!doctype html>
<html lang="pt">
  <body style="margin:0;padding:0;background:#F2EFE7;font-family:Georgia,'Times New Roman',serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F2EFE7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border:1px solid #C8C2B0;">
            <tr>
              <td style="padding:32px 28px;">
                <p style="margin:0 0 16px;font-size:16px;">Chegou um documento assinado, pronto para aprovação.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-size:15px;">
                  <tr><td style="padding:4px 0;color:#595959;width:110px;">Nome</td><td style="padding:4px 0;">${nome || '—'}</td></tr>
                  <tr><td style="padding:4px 0;color:#595959;">E-mail</td><td style="padding:4px 0;">${email}</td></tr>
                  <tr><td style="padding:4px 0;color:#595959;">Categoria</td><td style="padding:4px 0;">${categoriaLabel || '—'}</td></tr>
                  <tr><td style="padding:4px 0;color:#595959;">Telemóvel</td><td style="padding:4px 0;">${telefone || '—'}</td></tr>
                </table>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="background:#8A1C1C;">
                      <a href="${adminUrl}" style="display:inline-block;padding:16px 32px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;">Ver no painel admin →</a>
                    </td>
                  </tr>
                </table>
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

// Best-effort: telefone e categoria não vêm do token (só email/nome), por
// isso vão-se buscar à submissão "inscricao" original via API do Netlify.
// Se isto falhar, os emails seguem sem esses dois campos em vez de bloquear.
async function enriquecerDados(email) {
    try {
        const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
        const siteId = process.env.NETLIFY_SITE_ID;
        if (!netlifyToken || !siteId) return {};
        const formId = await findFormIdByName(siteId, 'inscricao', netlifyToken);
        if (!formId) return {};
        const submissoes = await listSubmissions(formId, netlifyToken);
        const submissao = submissoes.find((s) => s.data?.email === email);
        if (!submissao) return {};
        const categoria = submissao.data?.tipo_associado || null;
        return {
            categoriaLabel: CATEGORIA_LABELS[categoria] || categoria || null,
            telefone: submissao.data?.telefone || null,
        };
    } catch {
        return {};
    }
}

export default async (req) => {
    let body;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado JSON.' }, { status: 400 });
    }

    const token = typeof body.token === 'string' ? body.token.trim() : '';
    if (!token) {
        return Response.json({ error: 'token em falta.' }, { status: 400 });
    }

    let record;
    try {
        const store = getInscricaoTokensStore();
        record = await store.get(token, { type: 'json' });
        if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
            return Response.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
        }
    } catch {
        return Response.json({ error: 'Falha ao validar o token.' }, { status: 502 });
    }

    const smtp = getTransporter();
    if (!smtp) {
        return Response.json(
            { ok: false, sent: false, stub: true, error: 'Envio automático por email ainda não está ligado — falta configuração SMTP.' },
            { status: 501 }
        );
    }

    const { email, nome } = record;
    const { categoriaLabel, telefone } = await enriquecerDados(email);
    const adminUrl = `${new URL(req.url).origin}/admin/`;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    const [clienteResult, adminResult] = await Promise.allSettled([
        smtp.sendMail({
            from,
            to: email,
            subject: 'Recebemos o seu documento assinado — ACIMHA',
            html: buildClienteEmailHtml({ nome }),
        }),
        smtp.sendMail({
            from,
            to: ADMIN_EMAIL,
            subject: `Nova inscrição pronta para aprovação — ${nome || email}`,
            html: buildAdminEmailHtml({ nome, email, categoriaLabel, telefone, adminUrl }),
        }),
    ]);

    return Response.json({
        ok: true,
        cliente: clienteResult.status === 'fulfilled',
        admin: adminResult.status === 'fulfilled',
    });
};
