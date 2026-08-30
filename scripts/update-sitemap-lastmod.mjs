// Atualiza <lastmod> em sitemap.xml com a data do último commit git de cada ficheiro.
// Não depende de nenhum pacote — usa apenas `git log` e fs.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const SITEMAP_PATH = new URL('../sitemap.xml', import.meta.url);

const URL_TO_FILE = {
  'https://acimha.pt/': 'index.html',
  'https://acimha.pt/politica-privacidade.html': 'politica-privacidade.html',
  'https://acimha.pt/termos-condicoes.html': 'termos-condicoes.html',
  'https://acimha.pt/apoio-juridico/faro/': 'apoio-juridico/faro/index.html',
  'https://acimha.pt/apoio-juridico/portimao/': 'apoio-juridico/portimao/index.html',
  'https://acimha.pt/apoio-juridico/lagos/': 'apoio-juridico/lagos/index.html',
};

function lastCommitDate(file) {
  const out = execFileSync('git', ['log', '-1', '--format=%cd', '--date=short', '--', file], {
    encoding: 'utf8',
  }).trim();
  if (!out) {
    throw new Error(`Sem histórico git para ${file} — usa fetch-depth completo no checkout.`);
  }
  return out;
}

let xml = readFileSync(SITEMAP_PATH, 'utf8');

xml = xml.replace(/<url>([\s\S]*?)<\/url>/g, (block) => {
  const locMatch = block.match(/<loc>(.*?)<\/loc>/);
  const loc = locMatch?.[1];
  const file = URL_TO_FILE[loc];
  if (!file) return block;

  const date = lastCommitDate(file);
  return block.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${date}</lastmod>`);
});

writeFileSync(SITEMAP_PATH, xml);
console.log('sitemap.xml atualizado.');
