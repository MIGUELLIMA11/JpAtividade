# Auditoria técnica — evidências e limitações

## Missão 1: abrir e inspecionar

- Servidor local (`npm run dev`) iniciado e HTTP **200 OK** confirmado em `/`.
- JavaScript do projeto, servidor e script de captura passaram em `node --check`.
- Navegação com Chromium deste ambiente **bloqueada por política corporativa do navegador**: `URLBlocklist: ["*"]`, produzindo `127.0.0.1 is blocked`.
- **Console da aplicação: não foi possível verificar no navegador.** Não se deve registrar ausência de erros como se tivesse sido comprovada.
- `prints/01-inicio.png` deve ser criado em um navegador que permita acesso a localhost.

## Missão 2: Lighthouse

- Lighthouse CLI não está instalado/disponível neste ambiente, e a política do Chromium impede auditoria visual da URL.
- **Notas Antes**: pendentes, jamais estimadas.
- Problemas visíveis na implementação inicial, a verificar com Lighthouse real:
  - Formulário de lançamento com campos sem `label`/nome acessível.
  - Falta de `meta name="description"` na página.
  - Contraste baixo em alguns textos secundários (a confirmar por auditoria de contraste).

## Missão 3: viewport 375 × 667

- Missão executada com `chrome-devtools` em `http://localhost:5173` com viewport ajustado para **375 × 667**.
- Foi adicionado um gasto real no formulário: descrição `Despesa teste 50`, valor **R$ 50,00**, categoria padrão `Alimentação`.
- Captura real gerada em `prints/03-celular.png`.
- Não foi observado problema crítico de responsividade nessa execução: medição no navegador indicou `innerWidth = 375`, `clientWidth = 375`, `scrollWidth = 375` e nenhum elemento ultrapassando a largura do viewport.
- Observação de UX: a lista de transações fica visualmente densa em 375px, mas sem quebra estrutural nem rolagem horizontal.

## Missão 4: correção implementada

- Campos do formulário com rótulos explícitos; diálogo nomeado.
- Descrição SEO da página.
- Regras de layout de transações refeitas no breakpoint móvel, sem largura mínima fixa.
- Textos auxiliares com cores de maior contraste.
- **Notas Depois**: pendentes de execução de Lighthouse real.
- `prints/04-corrigido.png` depende de um Chrome/Chromium que abra a aplicação.

> **Importante:** esta é uma auditoria técnica por inspeção do código e execução de verificações Node/HTTP, **não** um relatório Lighthouse. A conexão `chrome-devtools` no OpenCode também necessita validação local com `/mcps`.

### Evidência adicional da missão 3

Além da captura, a própria UI confirmou a inclusão do lançamento: total de registros subiu de 6 para 7 e a linha `Despesa teste 50` apareceu em `Últimas transações` com `− R$ 50,00`.
