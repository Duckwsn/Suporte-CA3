# PLANO — Adicionar os 4 MCPs Faltantes ao OpenCode

## MISSÃO

Você está executando dentro do OpenCode.

O ambiente já possui diversos MCPs configurados e funcionando.

Sua missão é **NÃO recriar a infraestrutura existente**.

Você deve apenas analisar o ambiente e adicionar, configurar e validar os quatro MCPs que ainda faltam:

1. Serena
2. Chrome DevTools MCP
3. SQLite MCP
4. Fetch MCP

O objetivo é deixar o OpenCode com essas quatro novas capacidades integradas sem quebrar nenhuma configuração existente.

---

# 1. REGRA ABSOLUTA

NÃO reinstale MCPs que já estejam configurados.

NÃO substitua MCPs existentes.

NÃO remova MCPs existentes.

NÃO altere credenciais existentes.

NÃO sobrescreva configurações existentes sem necessidade.

NÃO faça alterações destrutivas.

Primeiro descubra o estado atual.

Somente depois implemente o que estiver faltando.

---

# 2. AUDITORIA INICIAL

Antes de modificar qualquer arquivo ou configuração, descubra:

* versão do OpenCode;
* sistema operacional;
* Node.js;
* npm;
* npx;
* Bun;
* Python;
* Git;
* Chrome/Chromium;
* SQLite;
* MCPs atualmente configurados;
* MCPs atualmente conectados;
* configuração global do OpenCode;
* configuração local do projeto;
* método atual de configuração dos MCPs.

Execute os comandos apropriados para o ambiente.

Comece verificando especialmente:

```bash
opencode --version
```

e:

```bash
opencode mcp list
```

Se a versão instalada utilizar comandos diferentes, consulte a documentação atual do OpenCode antes de prosseguir.

---

# 3. IDENTIFICAR OS QUATRO MCPs

Depois da auditoria, confirme individualmente:

```text
Serena
Chrome DevTools
SQLite
Fetch
```

Para cada um:

* verificar se já existe;
* verificar se está habilitado;
* verificar se está conectado;
* verificar se suas ferramentas estão disponíveis.

Se algum deles já estiver funcionando:

NÃO reinstale.

Apenas valide.

---

# 4. SERENA

## Objetivo

Adicionar ao OpenCode capacidade de compreensão semântica do código.

Serena deve ser utilizada para tarefas como:

* localizar classes;
* localizar funções;
* localizar métodos;
* localizar símbolos;
* encontrar referências;
* navegar entre definições;
* compreender relações entre arquivos;
* realizar refatorações;
* analisar grandes bases de código;
* modificar código de maneira semanticamente orientada.

## Estratégia

Primeiro descubra:

* implementação oficial/atual;
* requisitos;
* método recomendado de instalação;
* método recomendado de integração com MCP;
* compatibilidade com o sistema operacional;
* compatibilidade com a versão atual do OpenCode.

Não presuma que um comando encontrado em uma documentação antiga continua correto.

Consulte a documentação atual.

## Configuração

Configure Serena no OpenCode usando o mecanismo MCP suportado pela versão instalada.

Depois:

1. inicialize Serena;
2. conecte ao workspace atual;
3. verifique se o projeto foi reconhecido;
4. teste uma busca semântica;
5. teste localização de símbolos;
6. confirme que as ferramentas aparecem no OpenCode.

## Teste obrigatório

Escolha um arquivo real do projeto.

Teste:

```text
localizar símbolo
→ localizar referências
→ navegar para definição
```

Se o projeto possuir uma estrutura adequada, teste também uma pequena operação de edição/refatoração.

---

# 5. CHROME DEVTOOLS MCP

## Objetivo

Adicionar debugging profundo de aplicações web.

O Chrome DevTools MCP deve complementar o Playwright.

### Playwright

Responsável principalmente por:

* navegar;
* clicar;
* preencher;
* testar;
* reproduzir fluxos.

### Chrome DevTools

Responsável principalmente por:

* console;
* erros JavaScript;
* DOM;
* Network;
* requests;
* responses;
* performance;
* carregamento;
* debugging.

Não substitua Playwright.

Não remova Playwright.

---

# 6. INSTALAÇÃO DO CHROME DEVTOOLS

Primeiro determine:

* Chrome instalado?
* Chromium instalado?
* versão disponível?
* Node/npm/npx disponíveis?
* implementação oficial do Chrome DevTools MCP compatível?

Consulte a documentação atual do projeto oficial.

Utilize a implementação oficial quando disponível.

Não instale um pacote aleatório com nome semelhante.

Não utilize implementação abandonada se existir uma oficial mantida.

---

# 7. CONFIGURAÇÃO DO CHROME DEVTOOLS

Configure o MCP de forma que o OpenCode consiga iniciar/conectar ao navegador e utilizar as ferramentas disponíveis.

Depois valide:

```text
OpenCode
↓
Chrome DevTools MCP
↓
Chrome/Chromium
↓
Página de teste
```

---

# 8. TESTE DO CHROME DEVTOOLS

Crie ou utilize uma página local simples.

Exemplo:

```html
<!DOCTYPE html>
<html>
<body>
    <button onclick="console.error('TESTE MCP')">
        Testar
    </button>
</body>
</html>
```

Abra a página através do navegador.

Use o MCP para:

1. acessar a página;
2. localizar o botão;
3. interagir com ele;
4. observar o console;
5. localizar o erro gerado;
6. confirmar que o MCP conseguiu acessar os dados do DevTools.

O resultado esperado é o agente conseguir observar:

```text
console.error('TESTE MCP')
```

---

# 9. SQLITE MCP

## Objetivo

Adicionar capacidade de trabalhar diretamente com bancos SQLite.

O MCP deve permitir ao OpenCode:

* descobrir databases;
* analisar schema;
* listar tabelas;
* consultar tabelas;
* executar SQL;
* analisar relacionamentos;
* investigar dados;
* auxiliar em debugging de aplicações que utilizam SQLite.

---

# 10. INSTALAÇÃO SQLITE

Primeiro descubra se SQLite já está instalado no sistema.

Verifique também se o projeto atual utiliza:

```text
.sqlite
.db
.sqlite3
```

ou outros arquivos SQLite.

Depois procure uma implementação MCP adequada.

Prioridade:

1. implementação oficial/confiável;
2. implementação mantida;
3. implementação compatível com OpenCode;
4. implementação com configuração simples e segura.

Não instale vários SQLite MCPs.

Escolha apenas um.

---

# 11. SEGURANÇA DO SQLITE

Por padrão:

NÃO altere dados reais.

Prefira inicialmente:

```text
SELECT
PRAGMA
schema inspection
```

Evite:

```text
DROP
DELETE
UPDATE
ALTER
```

durante o teste inicial.

Se precisar criar um banco de teste, faça isso em uma área temporária.

---

# 12. TESTE SQLITE

Crie ou utilize um banco de teste.

Estrutura:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
);
```

Insira alguns dados de teste.

Depois utilize o MCP para:

1. localizar o banco;
2. descobrir a tabela;
3. consultar o schema;
4. executar:

```sql
SELECT * FROM users;
```

5. confirmar que os resultados retornaram corretamente.

---

# 13. FETCH MCP

## Objetivo

Adicionar capacidade de realizar requisições HTTP e obter conteúdo remoto.

O Fetch deve ser utilizado para:

* consultar APIs;
* obter documentação;
* acessar endpoints;
* analisar respostas HTTP;
* obter páginas/conteúdo público;
* investigar integrações;
* recuperar informações técnicas.

---

# 14. FETCH NÃO SUBSTITUI CHROME

Utilize:

### Fetch

Para:

```text
HTTP
API
JSON
documentação
conteúdo remoto
```

Utilize:

### Chrome DevTools

Para:

```text
browser
DOM
JavaScript
console
network
performance
renderização
```

Utilize:

### Playwright

Para:

```text
interação
automação
testes E2E
fluxos de usuário
```

O agente deve decidir automaticamente qual utilizar.

---

# 15. TESTE FETCH

Depois da instalação:

faça uma requisição HTTP simples a um endpoint público e confiável.

Verifique:

* status HTTP;
* headers quando disponíveis;
* conteúdo;
* JSON quando aplicável;
* tratamento de erro.

Não utilize endpoints que exijam credenciais durante o teste.

---

# 16. CONFIGURAÇÃO DO OPENCODE

Antes de editar:

localize a configuração atual.

Não substitua o arquivo inteiro.

Faça apenas alterações incrementais.

Preserve:

* MCPs existentes;
* agentes;
* providers;
* permissões;
* credenciais;
* configurações personalizadas.

Se houver necessidade de backup, faça-o antes da alteração.

---

# 17. CREDENCIAIS

Esses quatro MCPs devem ser avaliados individualmente quanto à necessidade de autenticação.

Prioridade:

```text
sem autenticação
↓
OAuth
↓
token/API key
```

Não crie API keys.

Não invente tokens.

Não solicite credenciais se a ferramenta não precisar delas.

Nunca coloque secrets:

* no código;
* no JSON de configuração quando houver alternativa segura;
* no Git;
* em documentação;
* no relatório final.

---

# 18. NÃO INVENTAR COMANDOS

Esta regra é extremamente importante.

Não invente:

* nomes de pacotes;
* comandos npm;
* comandos npx;
* URLs;
* parâmetros;
* nomes de ferramentas;
* configurações MCP.

Se houver dúvida:

1. consulte documentação atual;
2. confirme a versão;
3. verifique o README oficial;
4. valide a sintaxe;
5. somente então execute.

---

# 19. ORDEM DE EXECUÇÃO

Execute nessa ordem:

## Fase 1

Auditoria.

## Fase 2

Serena.

## Fase 3

Chrome DevTools MCP.

## Fase 4

SQLite MCP.

## Fase 5

Fetch MCP.

## Fase 6

Validação completa.

---

# 20. NÃO CONTINUE SE UMA INSTALAÇÃO QUEBRAR

Se um MCP provocar:

* erro no OpenCode;
* erro de configuração;
* conflito;
* falha de inicialização;
* problema de autenticação;
* problema de dependência;

pare a instalação daquele MCP.

Investigue.

Corrija.

Valide.

Somente depois continue.

Não acumule cinco problemas simultaneamente.

---

# 21. VALIDAÇÃO FINAL

Ao final, o OpenCode deverá possuir:

```text
Serena                 ✓
Chrome DevTools MCP    ✓
SQLite MCP             ✓
Fetch MCP              ✓
```

Mas o símbolo ✓ só pode ser usado se:

1. o MCP estiver configurado;
2. o servidor iniciar;
3. as ferramentas forem descobertas;
4. pelo menos uma operação real funcionar.

---

# 22. TESTE DE INTEGRAÇÃO

Depois de instalar os quatro, faça uma tarefa que combine as ferramentas.

Exemplo:

```text
1. analisar um projeto web;
2. Serena localizar o código responsável por uma página;
3. iniciar a aplicação;
4. Chrome DevTools analisar console/network;
5. identificar um problema;
6. corrigir o código;
7. utilizar SQLite caso exista banco SQLite;
8. utilizar Fetch caso seja necessário consultar uma API;
9. validar novamente no navegador;
10. verificar o Git diff.
```

O objetivo desse teste é verificar que os MCPs não apenas funcionam individualmente, mas podem ser utilizados em conjunto.

---

# 23. COMPORTAMENTO FUTURO DO AGENTE

Depois que os MCPs estiverem configurados, o OpenCode deverá decidir automaticamente qual ferramenta utilizar.

Exemplo:

## Bug de frontend

```text
Serena
↓
Playwright
↓
Chrome DevTools
↓
Serena
↓
edição
↓
Playwright
↓
DevTools
```

## Bug de banco SQLite

```text
Serena
↓
SQLite
↓
análise
↓
edição
↓
SQLite
↓
teste
```

## Problema de API

```text
Serena
↓
Fetch
↓
análise
↓
Chrome DevTools
↓
correção
↓
teste
```

## Refatoração

```text
Serena
↓
análise semântica
↓
edição
↓
Git diff
↓
testes
```

---

# 24. DOCUMENTAÇÃO

Depois de tudo funcionando, crie:

```text
docs/MCP-ADDITIONAL-SETUP.md
```

Documente:

* Serena;
* Chrome DevTools MCP;
* SQLite MCP;
* Fetch MCP.

Para cada um registre:

* função;
* pacote utilizado;
* versão;
* configuração;
* dependências;
* autenticação;
* ferramentas disponíveis;
* teste realizado;
* problemas encontrados;
* solução aplicada;
* comando para diagnóstico;
* como reinstalar.

Não registre credenciais.

---

# 25. RELATÓRIO FINAL

Ao terminar, apresente:

## MCPs adicionados

| MCP             | Status | Testado | Função |
| --------------- | ------ | ------- | ------ |
| Serena          |        |         |        |
| Chrome DevTools |        |         |        |
| SQLite          |        |         |        |
| Fetch           |        |         |        |

## MCPs que já existiam

Confirme que NÃO foram alterados.

## Alterações realizadas

Liste exatamente os arquivos/configurações modificados.

## Testes

Liste os testes reais executados.

## Problemas

Liste qualquer problema encontrado e sua solução.

## Pendências

Somente liste algo se realmente existir.

---

# REGRA FINAL

Você não está começando a configuração do OpenCode do zero.

O ambiente já está configurado.

Sua única missão é adicionar:

```text
SERENA
CHROME DEVTOOLS MCP
SQLITE MCP
FETCH MCP
```

Preserve todo o resto.

O fluxo obrigatório é:

```text
AUDITAR
↓
VERIFICAR
↓
CONSULTAR DOCUMENTAÇÃO ATUAL
↓
INSTALAR
↓
CONFIGURAR
↓
TESTAR
↓
CORRIGIR
↓
VALIDAR
↓
DOCUMENTAR
```

Não considere um MCP concluído simplesmente porque ele apareceu no arquivo de configuração.

Considere concluído somente quando ele estiver:

```text
CONFIGURADO
+
CONECTADO
+
COM FERRAMENTAS DISPONÍVEIS
+
TESTADO
```

O resultado final deve ser um OpenCode mais poderoso sem destruir ou duplicar a infraestrutura MCP que já existe.
