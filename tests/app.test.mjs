import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../src/styles.css', import.meta.url), 'utf8');

test('configuração SEO e campos nomeados para acessibilidade', () => {
  assert.match(html, /<html lang="pt-BR">/);
  assert.match(html, /<meta name="description"/);
  for (const id of ['expenseName', 'expenseAmount', 'expenseCategory', 'expenseDate']) {
    assert.match(source, new RegExp(`<label for="${id}">`));
  }
  assert.match(source, /aria-label="Buscar transações"/);
});

test('correção responsiva declara lista sem largura mínima em celular', () => {
  assert.match(css, /@media\(max-width:730px\)[\s\S]*\.transaction-list\{min-width:0;width:100%\}/);
  assert.match(css, /grid-template-areas:"name value action" "cat date action"/);
});

test('app renderiza lançamentos e salva uma nova despesa sem dependências externas', async () => {
  const nodes = new Map();
  const store = new Map();
  const root = { innerHTML: '' };
  const element = selector => {
    if (!nodes.has(selector)) nodes.set(selector, {
      listeners: {},
      addEventListener(type, listener) { this.listeners[type] = listener; },
      showModal() {}, close() {}, focus() {}, setSelectionRange() {}
    });
    return nodes.get(selector);
  };
  globalThis.document = {
    querySelector(selector) { return selector === '#app' ? root : element(selector); },
    querySelectorAll() { return []; }
  };
  globalThis.localStorage = {
    getItem(key) { return store.get(key) ?? null; },
    setItem(key, value) { store.set(key, value); }
  };
  globalThis.FormData = class {
    get(key) {
      return { name: 'Café de teste', amount: '12.50', category: 'Alimentação', date: new Date().toISOString().slice(0, 10) }[key];
    }
  };
  globalThis.crypto ??= await import('node:crypto').then(module => module.webcrypto);
  await import(`../src/app.js?test=${Date.now()}`);
  assert.match(root.innerHTML, /Supermercado/);
  assert.match(root.innerHTML, /Adicionar gasto/);
  assert.match(root.innerHTML, /R\$\s*939,90/);
  const form = element('#expenseForm');
  form.listeners.submit({ preventDefault() {}, currentTarget: form });
  assert.match(root.innerHTML, /Café de teste/);
  assert.match(root.innerHTML, /R\$\s*952,40/);
  assert.match(store.get('bolso-claro-v1'), /Café de teste/);
});
