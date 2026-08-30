// As 3 páginas da Clínica de Habitação (faro/lagos/portimao) partilham nav e footer
// copiados verbatim (o site não tem build/templating). Este script falha se alguma
// copiar tiver ficado dessincronizada, para apanhar drift cedo em vez de silenciosamente.
import { readFileSync } from 'node:fs';

const FILES = [
  'apoio-juridico/faro/index.html',
  'apoio-juridico/lagos/index.html',
  'apoio-juridico/portimao/index.html',
];

function extract(html, tag) {
  const start = html.indexOf(`<${tag}`);
  const end = html.indexOf(`</${tag}>`, start) + `</${tag}>`.length;
  if (start === -1 || end === -1) {
    throw new Error(`Não encontrei <${tag}> no ficheiro.`);
  }
  return html.slice(start, end);
}

let ok = true;

for (const tag of ['nav', 'footer']) {
  const contents = FILES.map((file) => extract(readFileSync(file, 'utf8'), tag));
  const [baseline, ...rest] = contents;
  rest.forEach((content, i) => {
    if (content !== baseline) {
      ok = false;
      console.error(`<${tag}> difere entre ${FILES[0]} e ${FILES[i + 1]}.`);
    }
  });
}

if (!ok) {
  console.error(
    '\nAs páginas da clínica devem ter nav/footer idênticos entre si. Sincroniza manualmente.'
  );
  process.exit(1);
}

console.log('nav/footer sincronizados nas 3 páginas da clínica.');
