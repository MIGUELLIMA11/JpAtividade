const STORE_KEY = 'bolso-claro-v1';
const fixedIncome = 5800;
const budget = 3100;
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const today = new Date();
const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(today);
const monthKey = isoToday.slice(0, 7);
const iconFor = { Alimentação: '◉', Moradia: '⌂', Transporte: '↗', Assinaturas: '▣', Saúde: '✚', Outros: '✧' };
const palette = { Alimentação: '#e5ad68', Moradia: '#9275db', Transporte: '#64a2e7', Assinaturas: '#db82aa', Saúde: '#63b998', Outros: '#9ba9b8' };

function seededExpenses() {
  return [
    { id: 'demo-1', name: 'Supermercado', amount: 456.70, category: 'Alimentação', date: isoToday },
    { id: 'demo-2', name: 'Internet residencial', amount: 119.90, category: 'Moradia', date: isoToday },
    { id: 'demo-3', name: 'Passe de transporte', amount: 220.00, category: 'Transporte', date: isoToday },
    { id: 'demo-4', name: 'Streaming', amount: 39.90, category: 'Assinaturas', date: isoToday },
    { id: 'demo-5', name: 'Almoço', amount: 35.50, category: 'Alimentação', date: isoToday },
    { id: 'demo-6', name: 'Farmácia', amount: 67.90, category: 'Saúde', date: isoToday }
  ];
}

function readExpenses() {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return seededExpenses();
    const result = JSON.parse(stored);
    return Array.isArray(result) ? result.filter(item => item && typeof item.name === 'string' && Number.isFinite(item.amount)) : seededExpenses();
  } catch {
    return seededExpenses();
  }
}

let expenses = readExpenses();
let search = '';
let categoryFilter = 'Todas';
const root = document.querySelector('#app');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function amount(value) { return currency.format(value); }
function dateDisplay(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}
function thisMonth(item) { return item.date.slice(0, 7) === monthKey; }
function persist() { localStorage.setItem(STORE_KEY, JSON.stringify(expenses)); }

function render() {
  const monthly = expenses.filter(thisMonth);
  const spent = monthly.reduce((sum, item) => sum + Number(item.amount), 0);
  const remaining = fixedIncome - spent;
  const grouped = Object.keys(iconFor).map(name => ({
    name,
    value: monthly.filter(item => item.category === name).reduce((sum, item) => sum + item.amount, 0),
    color: palette[name]
  })).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
  const maxCategory = Math.max(...grouped.map(item => item.value), 1);
  const visible = monthly.filter(item =>
    (categoryFilter === 'Todas' || item.category === categoryFilter) &&
    `${item.name} ${item.category}`.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))
  ).sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <a class="brand" href="/" aria-label="Bolso Claro, início">
          <span class="brand-symbol" aria-hidden="true">↗</span>
          <span>bolso<span class="brand-light">claro</span><small>SEU DINHEIRO EM ORDEM</small></span>
        </a>
        <div class="nav-caption">MENU PRINCIPAL</div>
        <nav aria-label="Menu principal">
          <a href="#visao-geral" class="nav-link selected"><span aria-hidden="true">◫</span> Visão geral</a>
          <a href="#transacoes" class="nav-link"><span aria-hidden="true">⇄</span> Transações</a>
          <a href="#categorias" class="nav-link"><span aria-hidden="true">◉</span> Categorias</a>
        </nav>
        <div class="sidebar-bottom"><span class="sidebar-dot"></span><div><strong>Seus dados, seu controle</strong><small>Salvos neste navegador</small></div></div>
      </aside>
      <main id="visao-geral" class="main-area">
        <header class="topbar">
          <div class="breadcrumb">Painel <span>/</span> Visão geral</div>
          <div class="topbar-right"><span class="today-pill"><span class="status-dot"></span>${escapeHtml(monthName)}</span><span class="avatar" aria-label="Perfil demonstrativo">BC</span></div>
        </header>
        <div class="content">
          <div class="hero-heading"><div><p class="eyebrow">PAINEL FINANCEIRO</p><h1>Mais clareza, menos preocupação<span class="accent">.</span></h1><p class="subtitle">Tudo o que importa sobre seus gastos, em um só lugar.</p></div><button class="primary-btn" id="openExpense"><span class="plus" aria-hidden="true">＋</span> Adicionar gasto</button></div>
          <section class="stats" aria-label="Resumo financeiro">
            <article class="stat-card"><span class="stat-icon income-icon" aria-hidden="true">↙</span><p>Receita do mês</p><strong>${amount(fixedIncome)}</strong><small class="stat-small">Valor demonstrativo fixo</small></article>
            <article class="stat-card"><span class="stat-icon expense-icon" aria-hidden="true">↗</span><p>Despesas do mês</p><strong>${amount(spent)}</strong><small class="stat-small">${monthly.length} lançamento(s) registrado(s)</small></article>
            <article class="stat-card highlight-card"><span class="stat-icon balance-icon" aria-hidden="true">◈</span><p>Saldo disponível</p><strong>${amount(remaining)}</strong><small class="stat-small">Receita menos despesas</small></article>
          </section>
          <div class="content-grid">
            <section id="categorias" class="panel category-panel" aria-labelledby="categoryTitle">
              <div class="panel-head"><div><p class="eyebrow">ONDE FOI O DINHEIRO?</p><h2 id="categoryTitle">Gastos por categoria</h2></div><span class="small-tag">${escapeHtml(monthName)}</span></div>
              <div class="categories">${grouped.length ? grouped.map(cat => `
                <div class="category-item"><div class="category-item-head"><span class="category-name"><span class="category-swatch" style="background:${cat.color}"></span>${escapeHtml(cat.name)}</span><strong>${amount(cat.value)}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${(cat.value/maxCategory*100).toFixed(1)}%;background:${cat.color}"></div></div></div>
              `).join('') : '<p class="empty-message">Nenhum gasto neste mês.</p>'}</div>
            </section>
            <section class="panel budget-panel" aria-labelledby="budgetTitle"><div class="panel-head"><div><p class="eyebrow">SEU PLANEJAMENTO</p><h2 id="budgetTitle">Limite mensal</h2></div><span class="budget-icon" aria-hidden="true">◎</span></div><div class="budget-amount">${amount(spent)} <span>de ${amount(budget)}</span></div><div class="budget-track"><div class="budget-fill" style="width:${Math.min(100, spent / budget * 100).toFixed(1)}%"></div></div><div class="budget-bottom"><span>${Math.round(spent / budget * 100)}% utilizado</span><strong>${spent > budget ? 'Acima do limite' : `${amount(budget - spent)} restantes`}</strong></div><div class="budget-note"><span aria-hidden="true">✳</span><p>${spent > budget ? 'Você ultrapassou seu limite demonstrativo.' : 'Bom trabalho! Continue acompanhando suas despesas ao longo do mês.'}</p></div></section>
          </div>
          <section id="transacoes" class="panel transactions-panel" aria-labelledby="transactionTitle"><div class="panel-head transactions-header"><div><p class="eyebrow">ACOMPANHAMENTO</p><h2 id="transactionTitle">Últimas transações</h2></div><span class="count-tag">${visible.length} registro(s)</span></div><div class="toolbar"><input id="search" type="search" aria-label="Buscar transações" placeholder="Buscar transação..." value="${escapeHtml(search)}"/><select id="categoryFilter" aria-label="Filtrar transações por categoria"><option value="Todas">Todas as categorias</option>${Object.keys(iconFor).map(name => `<option value="${name}" ${name === categoryFilter ? 'selected' : ''}>${name}</option>`).join('')}</select></div><div class="transaction-list"><div class="transaction-head"><span>TRANSAÇÃO</span><span>CATEGORIA</span><span>DATA</span><span>VALOR</span><span>AÇÃO</span></div>${visible.length ? visible.map(item => `<div class="transaction-row"><div class="transaction-title"><span class="transaction-icon" style="--transaction-color:${palette[item.category] || palette.Outros}" aria-hidden="true">${iconFor[item.category] || '✧'}</span><strong>${escapeHtml(item.name)}</strong></div><span class="transaction-category">${escapeHtml(item.category)}</span><span class="transaction-date">${escapeHtml(dateDisplay(item.date))}</span><strong class="transaction-value">− ${amount(item.amount)}</strong><button class="delete-btn" data-delete="${escapeHtml(item.id)}" aria-label="Excluir gasto ${escapeHtml(item.name)}" title="Excluir gasto">×</button></div>`).join('') : '<p class="empty-message">Nenhuma transação encontrada. Experimente outra busca ou adicione um gasto.</p>'}</div></section>
          <footer>Bolso Claro · Projeto demonstrativo para atividade de Chrome DevTools MCP <span>•</span> Seus dados não saem deste navegador.</footer>
        </div>
      </main>
    </div>
    <dialog id="expenseDialog" aria-labelledby="dialogTitle"><form id="expenseForm" class="expense-form"><div class="dialog-head"><div><p class="eyebrow">NOVO LANÇAMENTO</p><h2 id="dialogTitle">Adicionar gasto</h2></div><button type="button" class="close-btn" id="closeExpense" aria-label="Fechar">×</button></div><p class="dialog-subtitle">Registre uma despesa para manter seu controle em dia.</p><div class="field"><label for="expenseName">Descrição do gasto</label><input id="expenseName" name="name" placeholder="Descrição (ex.: café)" maxlength="60" required autocomplete="off" /></div><div class="field"><label for="expenseAmount">Valor (R$)</label><input id="expenseAmount" name="amount" type="number" placeholder="Valor em reais (ex.: 25,00)" min="0.01" step="0.01" required /></div><div class="field"><label for="expenseCategory">Categoria</label><select id="expenseCategory" name="category" required>${Object.keys(iconFor).map(name => `<option value="${name}">${name}</option>`).join('')}</select></div><div class="field"><label for="expenseDate">Data da despesa</label><input id="expenseDate" name="date" type="date" value="${isoToday}" required /></div><div class="dialog-actions"><button type="button" class="secondary-btn" id="cancelExpense">Cancelar</button><button type="submit" class="primary-btn">Salvar gasto</button></div></form></dialog>
  `;
  bindEvents();
}

function bindEvents() {
  const dialog = document.querySelector('#expenseDialog');
  document.querySelector('#openExpense').addEventListener('click', () => dialog.showModal());
  document.querySelector('#closeExpense').addEventListener('click', () => dialog.close());
  document.querySelector('#cancelExpense').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.querySelector('#expenseForm').addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') || '').trim();
    const sum = Number(data.get('amount'));
    const category = String(data.get('category'));
    const date = String(data.get('date'));
    if (!name || !Number.isFinite(sum) || sum <= 0 || !Object.keys(iconFor).includes(category) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
    expenses.push({ id: crypto.randomUUID(), name, amount: Math.round(sum * 100) / 100, category, date });
    persist();
    render();
  });
  document.querySelector('#search').addEventListener('input', event => {
    const cursor = event.target.selectionStart;
    search = event.target.value;
    render();
    const field = document.querySelector('#search');
    field.focus();
    field.setSelectionRange(cursor, cursor);
  });
  document.querySelector('#categoryFilter').addEventListener('change', event => {
    categoryFilter = event.target.value;
    render();
  });
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => {
    expenses = expenses.filter(item => item.id !== button.dataset.delete);
    persist();
    render();
  }));
}

render();
