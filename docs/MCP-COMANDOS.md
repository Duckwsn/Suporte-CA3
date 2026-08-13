# Comandos MCP Disponíveis

Referência consolidada dos servidores MCP e seus comandos, com descrição de cada um,
quando e onde usar. Útil como guia rápido durante o desenvolvimento do projeto.

---

## Índice de Servidores

| Servidor | Sigla | Foco |
|---|---|---|
| [GitHub](#1-github) | github | Issues, PRs, repositórios, busca de código |
| [Serena](#2-serena) | serena | Inteligência de código (símbolos, refatoração, memória) |
| [Chrome DevTools](#3-chrome-devtools) | chrome-devtools | Automação e debug de navegador (Chrome) |
| [Playwright](#4-playwright) | playwright | Automação de navegador (E2E) |
| [Filesystem](#5-filesystem) | filesystem | Operações de arquivos e diretórios |
| [Git](#6-git) | git | Operações de Git locais |
| [Docker](#7-docker) | docker | Containers, imagens, redes, volumes |
| [SQLite](#8-sqlite) | sqlite | Banco SQLite + insights de negócio |
| [Memory (Knowledge Graph)](#9-memory-knowledge-graph) | memory | Grafo de conhecimento persistente |
| [Moonchild](#10-moonchild) | moonchild | Design systems, scenes e frames |

> **Uso geral**: todos os comandos MCP recebem parâmetros JSON. Quando o agente puder
> usar MCP para acelerar o processo, deve preferi-lo sobre comandos de terminal
> equivalentes.

---

## 1. GitHub

Autenticado na conta do usuário. Usa o token do `gh`. Ótimo para tarefas remotas de
repositório sem depender de `git push`.

### Issues
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_get_me` | Retorna dados do usuário autenticado | Antes de qualquer operação GitHub, para saber permissões/contexto |
| `github_list_issues` | Lista issues de um repositório (filtro por estado, labels, datas, ordenação, paginação) | Para ver issues abertas/fechadas |
| `github_issue_read` | Lê issue específica. `method`: `get`, `get_comments`, `get_sub_issues`, `get_parent`, `get_labels` | Para obter detalhes/comentários de uma issue |
| `github_issue_write` | Cria ou atualiza issue (`method: create` / `update`); define assignees, labels, milestone, estado, reason, campos custom | Criar/editar issues, fechar com `state_reason` |
| `github_add_issue_comment` | Adiciona comentário e/ou reação em issue ou PR (usar número do PR como `issue_number`) | Responder discussões, reagir com emoji |
| `github_sub_issue_write` | Gerencia sub-issues: `add`, `remove`, `reprioritize` (usa `after_id`/`before_id`), `replace_parent` | Hierarquia de issues |
| `github_search_issues` | Busca semântica por texto em issues (faz match com o significado, não só palavras-chave) | Encontrar issue por descrição conceitual |
| `github_list_issue_fields` | Lista campos custom de issue do repositório/organização | Antes de setar campos custom |
| `github_list_issue_types` | Lista tipos de issue suportados | Verificar tipos válidos antes de criar |
| `github_assign_copilot_to_issue` | Atribui um agente Copilot para resolver a issue (gera PR) | Automação de resolução de issues |

### Pull Requests
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_list_pull_requests` | Lista PRs (filtro por base/head, estado, autor, ordenação) | Ver PRs do repositório |
| `github_pull_request_read` | Lê PR. `method`: `get`, `get_diff`, `get_status`, `get_files`, `get_commits`, `get_review_comments`, `get_reviews`, `get_comments`, `get_check_runs` | Inspecionar diff, reviews, status de checks |
| `github_create_pull_request` | Cria PR (título, corpo, base/head, draft, reviewers) | Abrir PR de uma branch |
| `github_update_pull_request` | Atualiza PR (título, corpo, base, estado, draft, reviewers) | Ajustar PR existente |
| `github_update_pull_request_branch` | Atualiza a branch do PR com a base | Sincronizar PR desatualizado |
| `github_merge_pull_request` | Faz merge (método: `merge`, `squash`, `rebase`) | Concluir PR aprovado |
| `github_pull_request_review_write` | Cria/submete/exclui review: `create`, `submit_pending`, `delete_pending`, `resolve_thread`, `unresolve_thread`; eventos `APPROVE`/`REQUEST_CHANGES`/`COMMENT` | Revisar código no PR |
| `github_add_comment_to_pending_review` | Adiciona comentário inline a um review pendente (antes de submeter) | Revisão detalhada linha a linha |
| `github_add_reply_to_pull_request_comment` | Responde/reage a comentário de review de PR | Discutir um ponto de review |
| `github_request_copilot_review` | Solicita review automático do Copilot no PR | Feedback automatizado antes de review humano |
| `github_search_pull_requests` | Busca PRs por sintaxe de busca | Localizar PR específico |

### Repositórios e Arquivos
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_get_file_contents` | Lê conteúdo de arquivo ou lista diretório (parâmetros `path`, `ref`/`sha`, `fields`) | Ver arquivos remotos |
| `github_create_or_update_file` | Cria/atualiza arquivo remoto (precisa do `sha` para atualizar) | Edição remota direta |
| `github_push_files` | Envia vários arquivos num único commit | Commit em massa de arquivos novos |
| `github_delete_file` | Deleta arquivo remoto | Remover arquivo no GitHub |
| `github_create_repository` | Cria repositório (público/privado, org opcional) | Novo projeto |
| `github_fork_repository` | Cria fork | Copiar repositório para própria conta |
| `github_list_repository_collaborators` | Lista colaboradores (filtro por afiliação, paginação) | Ver quem tem acesso |

### Branches, Commits, Tags, Releases
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_list_branches` | Lista branches | Ver branches remotas |
| `github_create_branch` | Cria branch remota (a partir de `from_branch` ou padrão) | Branch via GitHub |
| `github_list_commits` | Lista commits de uma branch (filtro por autor, path, datas) | Histórico de commits |
| `github_get_commit` | Detalhes de um commit; `detail`: `none`, `stats`, `full_patch` | Analisar mudança específica |
| `github_search_commits` | Busca commits (autor, datas, mensagem, merge) | Encontrar commit específico |
| `github_list_tags` | Lista tags | Ver versões publicadas |
| `github_get_tag` | Detalhes de uma tag | Inspecionar tag |
| `github_list_releases` | Lista releases | Ver versões |
| `github_get_latest_release` | Release mais recente | Ver última versão |
| `github_get_release_by_tag` | Release por tag | Ver release específico |

### Busca Global
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_search_code` | Busca código em TODOS os repositórios GitHub (símbolos, funções, classes) | Encontrar padrões de código, exemplos |
| `github_search_repositories` | Busca repositórios (por nome, descrição, tópicos, estrelas) | Descobrir projetos |
| `github_search_users` | Busca usuários | Localizar devs/colaboradores |

### Times
| Comando | Descrição | Quando usar |
|---|---|---|
| `github_get_teams` | Times dos quais o usuário é membro | Ver contexto de equipe |
| `github_get_team_members` | Membros de um time de organização | Ver membros |
| `github_get_label` | Detalhes de um label do repositório | Ver label antes de aplicar |

---

## 2. Serena

Análise de código com LSP. **OBRIGATÓRIO**: antes de iniciar qualquer tarefa de código,
ler o "Serena Instructions Manual" (`serena_initial_instructions`).

### Exploração de Código
| Comando | Descrição | Quando usar |
|---|---|---|
| `serena_initial_instructions` | Manual de instruções do Serena | Sempre, no início de tarefas de código |
| `serena_onboarding` | Instruções de onboarding (uma vez) | Se onboarding não foi feito |
| `serena_get_symbols_overview` | Visão geral de símbolos de um arquivo (classes, funções) | Primeiro passo para entender arquivo novo |
| `serena_find_symbol` | Busca símbolos por padrão de name path; suporta `depth`, `substring_matching`, `include_body`, `include_info`, filtro por tipos (kinds) | Localizar classes/métodos/funções |
| `serena_find_declaration` | Encontra a declaração de um símbolo via regex com grupo | Onde um símbolo é definido |
| `serena_find_implementations` | Implementações de um símbolo (interfaces/classes) | Quem implementa o quê |
| `serena_find_referencing_symbols` | Referências a um símbolo com snippet | Quem usa um símbolo |
| `serena_get_diagnostics_for_file` | Diagnósticos (erros/avisos LSP) de um arquivo | Verificar erros de compilação/lint |
| `serena_search_for_pattern` | Busca regex em arquivos do projeto (com contexto e filtros) | Buscar padrões de texto |

### Edição de Código
| Comando | Descrição | Quando usar |
|---|---|---|
| `serena_replace_symbol_body` | Substitui o corpo de um símbolo | Reescrever método/classe inteiro |
| `serena_insert_after_symbol` | Insere conteúdo após um símbolo | Adicionar método/código após definição |
| `serena_insert_before_symbol` | Insere conteúdo antes de um símbolo | Adicionar classe/import/função |
| `serena_safe_delete_symbol` | Exclui símbolo se seguro (sem referências) | Remover código morto com segurança |
| `serena_rename_symbol` | Renomeia símbolo no código inteiro | Renomear classe/método/variável |
| `serena_replace_content` | Substitui padrão (literal ou regex) em um arquivo | Edição cirúrgica com wildcards |
| `serena_replace_in_files` | Substitui padrão em vários arquivos (com dry-run e `occurrence_ids`) | Renomes/edições em massa |

### Memória
| Comando | Descrição | Quando usar |
|---|---|---|
| `serena_list_memories` | Lista memórias (filtro por tópico) | Ver o que já foi memorizado |
| `serena_read_memory` | Lê uma memória pelo nome | Carregar contexto salvo |
| `serena_write_memory` | Escreve memória em formato md (usar `mem:` para referenciar outras) | Salvar conhecimento útil do projeto |
| `serena_edit_memory` | Edita conteúdo de memória (regex/literal) | Atualizar memória existente |
| `serena_rename_memory` | Renomeia/move memória (organizar por tópico com `/`) | Reorganizar memórias |
| `serena_delete_memory` | Exclui memória (somente se autorizado) | Limpar memória obsoleta |

---

## 3. Chrome DevTools

Automação e debugging de navegador via protocolo DevTools. Ideal para verificação visual
de UI, console, rede e performance do frontend (Vite, localhost).

### Navegação e Páginas
| Comando | Descrição | Quando usar |
|---|---|---|
| `chrome-devtools_list_pages` | Lista abas/páginas abertas | Saber o que está aberto |
| `chrome-devtools_new_page` | Abre nova aba (URL, background, isolatedContext) | Abrir app/página |
| `chrome-devtools_select_page` | Seleciona página como contexto para os próximos comandos | Trabalhar em página específica |
| `chrome-devtools_close_page` | Fecha página por índice | Fechar aba |
| `chrome-devtools_navigate_page` | Navega (URL, back, forward, reload); `handleBeforeUnload`, `initScript` | Ir para URL ou recarregar |
| `chrome-devtools_resize_page` | Redimensiona a janela | Testar responsividade (mobile/desktop) |
| `chrome-devtools_emulate` | Emula: rede (Offline/3G/4G), CPU throttle, geolocation, userAgent, colorScheme, viewport, headers HTTP | Testar cenários (ex.: viewport mobile) |

### Interação com a Página
| Comando | Descrição | Quando usar |
|---|---|---|
| `chrome-devtools_take_snapshot` | Snapshot de acessibilidade (árvore a11y com uids) — preferir sobre screenshot | Entender o estado da UI |
| `chrome-devtools_take_screenshot` | Screenshot (página ou elemento; `fullPage`) | Prova visual / ver layout |
| `chrome-devtools_click` | Clica em elemento (uid); suporta `dblClick` | Interagir com UI |
| `chrome-devtools_hover` | Hover em elemento | Testar tooltips/menus |
| `chrome-devtools_fill` | Preenche input/textarea/select (checkbox: "true"/"false") | Preencher formulário (1 campo) |
| `chrome-devtools_fill_form` | Preenche vários campos de uma vez (preferir!) | Preencher formulário inteiro |
| `chrome-devtools_type_text` | Digita texto no input focado (com `submitKey`) | Digitação contínua |
| `chrome-devtools_press_key` | Pressiona tecla/combinação (Enter, Ctrl+A...) | Atalhos/navegação por teclado |
| `chrome-devtools_drag` | Arrasta um elemento para outro | Drag and drop |
| `chrome-devtools_upload_file` | Envia arquivo via input file | Upload |
| `chrome-devtools_wait_for` | Espera texto aparecer na página | Aguardar carregamento/resultado |
| `chrome-devtools_handle_dialog` | Lida com dialogo do navegador (alert/confirm/prompt) | Aceitar/recusar diálogo |

### Console e Rede
| Comando | Descrição | Quando usar |
|---|---|---|
| `chrome-devtools_list_console_messages` | Lista mensagens do console (filtro por tipo, paginação, preservadas) | Ver erros/warnings JS |
| `chrome-devtools_get_console_message` | Detalhe de uma mensagem de console (por msgid) | Ler mensagem completa |
| `chrome-devtools_list_network_requests` | Lista requisições de rede (filtro por tipo) | Ver chamadas de API |
| `chrome-devtools_get_network_request` | Detalhes de uma requisição (headers/body) | Depurar request/response |

### Execução de Script
| Comando | Descrição | Quando usar |
|---|---|---|
| `chrome-devtools_evaluate_script` | Executa função JS na página e retorna JSON; `dialogAction`, `filePath` | Inspecionar DOM, estados, chamar funções |

### Performance
| Comando | Descrição | Quando usar |
|---|---|---|
| `chrome-devtools_performance_start_trace` | Inicia trace de performance (reload opcional) | Analisar Core Web Vitals (LCP, INP, CLS) |
| `chrome-devtools_performance_stop_trace` | Para trace e salva | Encerrar gravação |
| `chrome-devtools_performance_analyze_insight` | Detalha um insight do trace | Ex.: DocumentLatency, LCPBreakdown |
| `chrome-devtools_lighthouse_audit` | Auditoria Lighthouse (a11y, SEO, best practices; `mode`: navigation/snapshot; device) | Score de qualidade |
| `chrome-devtools_take_heapsnapshot` | Heap snapshot (memória) | Debug de vazamento de memória |

---

## 4. Playwright

Automação de navegador E2E. Alternativa ao Chrome DevTools; útil para fluxos de teste
automatizados e interações complexas.

| Comando | Descrição | Quando usar |
|---|---|---|
| `playwright_browser_navigate` | Navega para URL | Abrir página |
| `playwright_browser_navigate_back` | Voltar no histórico | Retroceder |
| `playwright_browser_tabs` | Lista/cria/fecha/seleciona abas | Gestão de abas |
| `playwright_browser_close` | Fecha a página | Encerrar |
| `playwright_browser_snapshot` | Snapshot de acessibilidade (com `depth`, `boxes`, salvar em arquivo) | Entender estado da UI |
| `playwright_browser_find` | Busca texto/regex no snapshot | Localizar elemento |
| `playwright_browser_take_screenshot` | Screenshot (`fullPage`, escala CSS/device) | Prova visual |
| `playwright_browser_click` | Clique (esquerdo/direito/meio, double, modificadores) | Interação |
| `playwright_browser_hover` | Hover | Tooltips/menus |
| `playwright_browser_fill_form` | Preenche múltiplos campos (textbox/checkbox/radio/combobox/slider) | Formulários |
| `playwright_browser_type` | Digita texto (opção `slowly`, `submit`) | Digitação com eventos |
| `playwright_browser_press_key` | Tecla/combinação | Atalhos |
| `playwright_browser_select_option` | Seleciona opção em dropdown | Selects |
| `playwright_browser_drag` | Drag entre elementos | Drag and drop |
| `playwright_browser_drop` | Solta arquivos/dados MIME num elemento | Simular drop externo |
| `playwright_browser_handle_dialog` | Lida com diálogo (accept/promptText) | Alert/confirm/prompt |
| `playwright_browser_evaluate` | Executa JS na página ou elemento (`target`) | Inspeção/computação |
| `playwright_browser_run_code_unsafe` | Executa snippet Playwright arbitrário (equivalente a RCE) | Controle total do navegador |
| `playwright_browser_file_upload` | Upload de arquivos | Upload |
| `playwright_browser_console_messages` | Mensagens do console (`level`, `all`, salvar em arquivo) | Debug JS |
| `playwright_browser_network_requests` | Lista requisições de rede (`static`, `filter` regex) | Ver chamadas |
| `playwright_browser_network_request` | Detalhes de uma requisição (headers/body, `part`) | Analisar request |
| `playwright_browser_resize` | Redimensiona janela | Responsividade |
| `playwright_browser_wait_for` | Espera texto aparecer/desaparecer ou tempo | Aguardar estado |

---

## 5. Filesystem

Operações de arquivos e diretórios. Restrito aos diretórios permitidos (raiz do projeto).

| Comando | Descrição | Quando usar |
|---|---|---|
| `filesystem_list_allowed_directories` | Lista diretórios permitidos | Antes de acessar arquivos |
| `filesystem_directory_tree` | Árvore recursiva de arquivos/diretórios (com `excludePatterns`) | Visão da estrutura |
| `filesystem_list_directory` | Lista detalhada (arquivos vs diretórios) | Ver conteúdo de pasta |
| `filesystem_list_directory_with_sizes` | Lista com tamanhos (ordenação por nome/tamanho) | Ver tamanhos/arquivos grandes |
| `filesystem_search_files` | Busca recursiva por glob (`*.ext`, `**/*.ext`) | Encontrar arquivos |
| `filesystem_read_text_file` | Lê arquivo texto (head/tail para ler trechos) | Ler conteúdo |
| `filesystem_read_file` | Lê arquivo (deprecado, preferir `read_text_file`) | - |
| `filesystem_read_multiple_files` | Lê vários arquivos de uma vez | Ler vários arquivos em paralelo |
| `filesystem_read_media_file` | Lê imagem/áudio como base64 com MIME | Analisar imagem/áudio |
| `filesystem_get_file_info` | Metadados do arquivo (tamanho, datas, permissões) | Info de arquivo |
| `filesystem_write_file` | Cria/substitui arquivo | Criar/sobrescrever |
| `filesystem_edit_file` | Edições linha a linha (dif-style, `dryRun`) | Editar texto |
| `filesystem_move_file` | Move/renomeia | Reorganizar |
| `filesystem_create_directory` | Cria diretório (nested, idempotente) | Estrutura de pastas |

---

## 6. Git

Operações de Git locais (repositório já inicializado).

| Comando | Descrição | Quando usar |
|---|---|---|
| `git_git_init` | Inicializa repositório | Novo repo |
| `git_git_status` | Estado do working tree | Antes de commitar |
| `git_git_add` | Adiciona arquivos ao staging | Preparar commit |
| `git_git_commit` | Cria commit com mensagem | Commitar (somente quando solicitado) |
| `git_git_log` | Histórico de commits | Ver commits |
| `git_git_show` | Conteúdo de um commit | Inspecionar commit |
| `git_git_diff` | Diff entre branches/commits | Comparar |
| `git_git_diff_staged` | Diff do que está staged | Revisar antes de commit |
| `git_git_diff_unstaged` | Diff não staged | Mudanças locais |
| `git_git_reset` | Remove do staging | Desfazer staging |
| `git_git_checkout` | Troca de branch | Mudar branch |
| `git_git_create_branch` | Cria branch | Nova branch |
| `git_git_stash` | Guarda mudanças | Pausar trabalho |
| `git_git_stash_apply` / `git_git_stash_pop` | Restaura stash | Retomar trabalho |

> **Regra**: nunca commitar/amendar/push sem autorização explícita do usuário.

---

## 7. Docker

Gestão de containers, imagens, redes e volumes. Usado no projeto para o banco
PostgreSQL (`suporte-ca3-db`).

### Containers
| Comando | Descrição | Quando usar |
|---|---|---|
| `docker_list_containers` | Lista containers (running/all, filtro por label) | Ver o que está rodando |
| `docker_run_container` | Cria e inicia container (preferido) | Subir serviço |
| `docker_create_container` | Cria container (sem iniciar) | Preparar |
| `docker_start_container` | Inicia container existente | Subir parado |
| `docker_stop_container` | Para container | Parar |
| `docker_recreate_container` | Para, remove e recria | Recriar com novas configs |
| `docker_remove_container` | Remove container (`force`) | Limpar |
| `docker_fetch_container_logs` | Logs do container (`tail`) | Debug de erro |

### Imagens
| Comando | Descrição | Quando usar |
|---|---|---|
| `docker_list_images` | Lista imagens | Ver imagens locais |
| `docker_pull_image` | Baixa imagem | Obter imagem |
| `docker_build_image` | Constrói imagem a partir de Dockerfile | Build |
| `docker_push_image` | Envia imagem para registry | Publicar |
| `docker_remove_image` | Remove imagem (`force`) | Limpar |

### Redes e Volumes
| Comando | Descrição | Quando usar |
|---|---|---|
| `docker_create_network` | Cria rede | Isolar serviços |
| `docker_list_networks` | Lista redes | Ver redes |
| `docker_remove_network` | Remove rede | Limpar |
| `docker_create_volume` | Cria volume | Persistência |
| `docker_list_volumes` | Lista volumes | Ver volumes |
| `docker_remove_volume` | Remove volume (`force`) | Limpar |

---

## 8. SQLite

Banco SQLite local + memo de insights de negócio.

| Comando | Descrição | Quando usar |
|---|---|---|
| `sqlite_list_tables` | Lista tabelas | Ver schema existente |
| `sqlite_describe_table` | Schema de uma tabela | Entender colunas |
| `sqlite_read_query` | Executa SELECT | Consultar dados |
| `sqlite_write_query` | Executa INSERT/UPDATE/DELETE | Modificar dados |
| `sqlite_create_table` | Cria tabela (CREATE TABLE) | Novo schema |
| `sqlite_append_insight` | Adiciona insight de negócio ao memo | Registrar descoberta de análise |

> **Atenção**: o projeto principal usa **PostgreSQL** (Docker). Este SQLite é um
> banco auxiliar/local para análises e experimentos.

---

## 9. Memory (Knowledge Graph)

Grafo de conhecimento persistente (entidades, observações, relações). Usado para
guardar contexto de longo prazo entre sessões.

| Comando | Descrição | Quando usar |
|---|---|---|
| `memory_read_graph` | Lê o grafo inteiro | Ver todo o conhecimento |
| `memory_search_nodes` | Busca nós por query | Encontrar entidade relevante |
| `memory_open_nodes` | Abre nós específicos por nome | Ver entidade em detalhe |
| `memory_create_entities` | Cria entidades com observações | Registrar nova entidade |
| `memory_add_observations` | Adiciona observações a entidades existentes | Atualizar conhecimento |
| `memory_create_relations` | Cria relações entre entidades (voz ativa) | Ligar entidades |
| `memory_delete_entities` | Exclui entidades e relações | Limpar |
| `memory_delete_observations` | Exclui observações específicas | Editar conhecimento |
| `memory_delete_relations` | Exclui relações | Editar ligações |

---

## 10. Moonchild

Design systems, scenes e frames (UX/UI). Para consultar componentes de design, estilos
e exportar HTML/CSS de frames.

### Organizações, Scenes e Frames
| Comando | Descrição | Quando usar |
|---|---|---|
| `moonchild_organization_list` | Lista organizações do usuário (id, nome, role) | Contexto organizacional |
| `moonchild_scene_list` | Lista scenes (filtro por org, paginação) | Encontrar projeto visual |
| `moonchild_scene_get` | Detalhes de uma scene + resumo dos frames | Ver frames de um projeto |
| `moonchild_frame_get` | Metadados de um frame (design system vinculado, screenshot disponível) | Ver frame |
| `moonchild_frame_get_export` | Export de frame para geração de código: HTML + CSS do design system + fontes + imagens (`imagesAs`: urls/inline) | Base para implementar UI |
| `moonchild_frame_get_screenshot` | Screenshot PNG do frame (modo light/dark) | Ver visual do frame |
| `moonchild_url_resolve` | Faz parse de URL Moonchild em referência estruturada (scene/frame/design_system) | Traduzir URL em ids |

### Design Systems
| Comando | Descrição | Quando usar |
|---|---|---|
| `moonchild_design_system_list` | Lista design systems (filtro por org, paginação) | Encontrar DS |
| `moonchild_design_system_get` | Metadados do DS, versão, índice de arquivos por seção | Entender o DS |
| `moonchild_design_system_get_files` | Conteúdo de arquivos específicos por path | Ler CSS/JS dos componentes |
| `moonchild_design_system_get_bundle` | Bundle CSS completo (pesado; preferir `get` + `get_files`) | Uso pontual de CSS completo |
| `moonchild_design_system_search` | Busca por linguagem natural nos arquivos do DS | Achar componente/estilo certo |
| `moonchild_design_system_list_versions` | Versões publicadas do DS | Ver histórico/versões |

---

## Ferramentas não-MCP (para referência)

Não são MCP, mas complementam o trabalho diário:

| Ferramenta | Descrição | Quando usar |
|---|---|---|
| `bash` | Executa comandos de terminal (cmd.exe; `workdir` para diretório) | npm, git, docker CLI, scripts |
| `read` / `write` / `edit` / `glob` / `grep` | Leitura/escrita/edição de arquivos, busca por padrão | Tarefas de arquivo comuns |
| `task` | Delega subagentes (`explore` para busca de código, `general` para pesquisa multistep) | Exploração extensa em paralelo |
| `question` | Pergunta ao usuário com opções | Esclarecer requisitos ambíguos |
| `todowrite` | Lista de tarefas estruturada | Planejar trabalho multi-etapas |
| `websearch` / `webfetch` / `fetch_fetch` | Busca/consulta na web | Pesquisa de informações atuais |
| `skill` | Carrega skill especializada | Tarefas com skill disponível |
| `sequential-thinking_sequentialthinking` | Raciocínio passo a passo para problemas complexos | Planejamento/análise |
| `list_mcp_resources` / `list_mcp_resource_templates` / `read_mcp_resource` | Lista/lê recursos MCP | Consumir recursos (ex.: `memory://knowledge-graph`) |

---

## Fluxo Recomendado no Projeto

1. **Tarefa de código**: `serena_initial_instructions` → explorar com Serena → editar →
   `npm run build` + `npm run lint` → validar no navegador (Chrome DevTools/Playwright) →
   commit/push via MCP Git/GitHub (somente se autorizado).
2. **Verificação de UI**: abrir `http://localhost:5173` no Chrome DevTools, logar com
   credenciais de seed, navegar e conferir console/rede.
3. **Banco de dados**: consultas/limpeza via `docker exec suporte-ca3-db psql -U CA3 -d CA3 -c "..."`.
4. **Servidores**: rodar backend/frontend com PowerShell `Start-Process` (log em
   `C:\Users\WIN11~1\AppData\Local\Temp\opencode\*.log`).

---
*Última atualização: 2026-08-11*
