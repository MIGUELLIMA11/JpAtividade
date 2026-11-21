# Bolso Claro — controle de gastos

Aplicação demonstrativa para a atividade **Depurando o app com o MCP do Chrome DevTools**.

## Executar

Requisitos: Node.js 20+ e Google Chrome para o MCP do Chrome DevTools.

```bash
npm run dev
```

Acesse **http://localhost:5173**. Este projeto usa um servidor HTTP Node.js sem dependências; por isso, `npm install` não é necessário.

Dados demonstrativos são carregados no primeiro acesso e podem ser editados com **Adicionar gasto** e **Excluir**. As alterações ficam no `localStorage` do navegador; não há backend nem transmissão de dados. A receita mensal (R$ 5.800) e o limite (R$ 3.100) são demonstrativos e fixos.

## OpenCode + Chrome DevTools MCP

O `opencode.json` já contém Context7 e `chrome-devtools`:

```json
"chrome-devtools": {
  "type": "local",
  "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
}
```

1. Instale o **Google Chrome** no computador e verifique a versão de Node.js.
2. Inicie `npm run dev` no terminal 1.
3. Inicie `opencode` no terminal 2, na mesma pasta do projeto.
4. Dentro do OpenCode, execute `/mcps` e confira se `chrome-devtools` aparece conectado.
5. Execute as missões seguindo os prompts em `MISSOES.md`. Não clique na janela de Chrome que o agente estiver controlando.

> O MCP é configurado, mas a conexão precisa ser confirmada em uma instalação local do OpenCode. O Chromium deste ambiente permite tirar prints, porém não substitui a confirmação do MCP no OpenCode.

## Arquivos da atividade

- `prints/01-inicio.png`: captura antes da correção (**a gerar no seu Chrome**, ou recuperar a versão do commit da missão 1).
- `prints/03-celular.png`: captura no viewport 375 × 667, com gasto adicionado (**a gerar**).
- `prints/04-corrigido.png`: captura depois da correção (**a gerar**).
- `RESULTADO.md`: avaliação antes/depois e explicações.
- `MISSOES.md`: prompts e passos para executar o Lighthouse no MCP.

## Validação rápida

```bash
npm run check
```

O projeto é propositalmente didático: o histórico de Git preserva uma versão inicial e a correção de problemas concretos de acessibilidade, SEO e layout responsivo.

## Testes e capturas auxiliares

```bash
npm run check
npm run test
```

Depois de iniciar `npm run dev`, os seguintes comandos podem gerar PNGs usando Chrome/Chromium em um computador sem bloqueio de navegação:

```bash
npm run capture -- inicio
npm run capture -- celular
npm run capture -- corrigido
```

O script de captura usa Chrome DevTools Protocol diretamente. **Ele não é o MCP do OpenCode nem executa Lighthouse.** Para a entrega acadêmica, prefira executar os prompts de `MISSOES.md` via OpenCode, que usará `chrome-devtools` propriamente dito. Se o Chrome não for encontrado automaticamente no Windows, defina a variável `CHROME_BIN` com o caminho do `chrome.exe`.

A captura `inicio` feita com o código corrigido **não equivale à evidência Antes**. Para reproduzir a tela original, use uma cópia do commit `86f03ed` (missão 1) ou execute o prompt da missão 1 sobre essa revisão. Depois retorne à última revisão para a captura corrigida.
