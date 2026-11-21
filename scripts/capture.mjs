/**
 * Browser evidence helper. Uses Chromium/Chrome CDP directly, with no npm dependencies.
 * This is NOT OpenCode and is NOT a Lighthouse audit.
 * Usage: npm run dev (another terminal); node scripts/capture.mjs inicio|celular|corrigido
 */
import { spawn } from 'node:child_process';
import { writeFile, mkdtemp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as pause } from 'node:timers/promises';

const mode = process.argv[2];
const modes = {
  inicio: { name: '01-inicio.png', width: 1440, height: 900, mobile: false },
  celular: { name: '03-celular.png', width: 375, height: 667, mobile: true },
  corrigido: { name: '04-corrigido.png', width: 375, height: 667, mobile: true }
};
if (!modes[mode]) {
  console.error('Uso: node scripts/capture.mjs inicio|celular|corrigido');
  process.exit(1);
}
const cfg = modes[mode];
const winPaths = [
  `${process.env['PROGRAMFILES'] || 'C:\\Program Files'}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`
];
const browserPath = process.env.CHROME_BIN || (process.platform === 'win32' ? (winPaths.find(existsSync) || 'chrome') : 'chromium');
const port = 9300 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), 'bolso-claro-browser-'));
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
  '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, 'about:blank'
], { stdio: 'ignore' });
let connection;
let counter = 0;
const pending = new Map();
const messages = [];
let ws;

const shutdown = async () => {
  if (ws?.readyState === 1) ws.close();
  browser.kill('SIGTERM');
  await pause(350);
  await rm(profile, { recursive: true, force: true, maxRetries: 4, retryDelay: 200 });
};
const command = async (method, params = {}) => {
  const id = ++counter;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
};
const evaluate = async expression => {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(result.exceptionDetails.text);
  return result.result.result?.value;
};

try {
  let page;
  for (let i = 0; i < 80; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const tabs = await response.json();
      page = tabs.find(tab => tab.type === 'page');
      if (page) break;
    } catch {}
    await pause(100);
  }
  if (!page) throw Error('Chrome/Chromium não iniciou a depuração remota.');
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  ws.addEventListener('message', event => {
    const obj = JSON.parse(event.data);
    if (obj.id) {
      const call = pending.get(obj.id);
      pending.delete(obj.id);
      if (obj.error) call?.reject(new Error(obj.error.message));
      else call?.resolve(obj);
    } else if (obj.method === 'Runtime.exceptionThrown') {
      messages.push({ level: 'error', text: obj.params.exceptionDetails?.text || 'Exceção' });
    } else if (obj.method === 'Runtime.consoleAPICalled') {
      const level = obj.params.type;
      if (level === 'warning' || level === 'error') messages.push({ level, text: obj.params.args?.map(arg => arg.value || arg.description).join(' ') || '' });
    } else if (obj.method === 'Log.entryAdded') {
      if (['warning', 'error'].includes(obj.params.entry.level)) messages.push({ level: obj.params.entry.level, text: obj.params.entry.text });
    }
  });

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Log.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width: cfg.width, height: cfg.height, deviceScaleFactor: 1, mobile: cfg.mobile
  });
  await command('Page.navigate', { url: process.env.APP_URL || 'http://127.0.0.1:5173' });
  let ready = false;
  for (let i = 0; i < 70; i++) {
    try {
      ready = await evaluate("document.readyState === 'complete' && Boolean(document.querySelector('.app-shell'))");
      if (ready) break;
    } catch {}
    await pause(100);
  }
  if (!ready) {
    const debug = await evaluate('({url: location.href, title:document.title, body:document.body?.innerText?.slice(0,600)})').catch(e => ({error:String(e)}));
    throw Error('Aplicação não carregou. Diagnóstico: '+JSON.stringify(debug)+' Logs: '+JSON.stringify(messages));
  }
  await pause(350);

  if (mode !== 'inicio') {
    const added = await evaluate(`(() => {
      document.querySelector('#openExpense').click();
      document.querySelector('#expenseName').value = 'Café de teste';
      document.querySelector('#expenseAmount').value = '12.50';
      document.querySelector('#expenseCategory').value = 'Alimentação';
      document.querySelector('#expenseForm').requestSubmit();
      return document.body.textContent.includes('Café de teste');
    })()`);
    if (!added) throw Error('Não foi possível adicionar o gasto de teste.');
  }
  const report = await evaluate(`(() => {
    const inputs = [...document.querySelectorAll('input, select')].filter(element => element.type !== 'hidden');
    const unlabeled = inputs.filter(el => !el.labels?.length && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby')).map(el => el.id);
    return {
      viewport: [innerWidth, innerHeight],
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      pageHeight: document.documentElement.scrollHeight,
      pageTitle: document.title,
      description: document.querySelector('meta[name="description"]')?.content || null,
      unlabeledInputs: unlabeled,
      expenseRows: document.querySelectorAll('.transaction-row').length,
      testExpenseVisible: document.body.textContent.includes('Café de teste')
    };
  })()`);
  const captureHeight = Math.min(report.pageHeight, 5000);
  const screenshot = await command('Page.captureScreenshot', {
    format: 'png', captureBeyondViewport: true,
    clip: { x: 0, y: 0, width: cfg.width, height: captureHeight, scale: 1 }
  });
  const target = resolve('prints', cfg.name);
  await writeFile(target, Buffer.from(screenshot.result.data, 'base64'));
  report.console = messages;
  console.log(JSON.stringify({ screenshot: target, ...report }, null, 2));
} catch (error) {
  console.error('Falha:', error?.message || error);
  process.exitCode = 1;
} finally {
  await shutdown();
}
