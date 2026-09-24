# BrainShake: referência para customizer, sidebar e workspace

## Objetivo

Reduzir ruído visual no customizer e na navegação, deixando as ações principais fáceis de achar. A direção visual é uma interface de desktop leve, inspirada no acabamento do macOS: tipografia de sistema, superfícies claras, contornos discretos, controles compactos e estados selecionados nítidos.

As capturas enviadas são referências visuais. A primeira documenta o customizer atual; a segunda orienta o tratamento dos controles (grupos claros, espaçamento, cores de estado e botões contidos). Os rótulos da segunda imagem não são requisitos funcionais para o BrainShake.

## Leitura do estado atual

### Customizer

- A aba `Customize` reúne grade, posição do dock, auto-hide, tema, dez cores de destaque, quatro substituições de cor da interface, desenho e acessibilidade em uma coluna longa.
- `Theme` e os swatches de destaque são a personalização global mais frequente. Já `Header`, `Sidebar`, `Canvas` e `Panels` são ajustes finos e podem ficar em uma área avançada recolhida.
- Os valores hexadecimais, botões `Reset` e seletores de cor criam linhas com pesos visuais diferentes. Os quatro resets aumentam a altura da página.
- O texto de ajuda do autocorrect é extenso para um ajuste simples; as opções de acessibilidade também incluem descrições que ocupam bastante espaço.
- No screenshot estreito, o cabeçalho de abas ocupa uma faixa inteira; o conteúdo tem rótulos pequenos, alinhamentos soltos e separadores repetidos.

### Sidebar de workspace

- A mesma coluna contém ações de canvas, importação de arquivo, importação por URL, exportação, boards, snapshots e links de rodapé.
- Import e export aparecem também no topbar. Essa duplicação aumenta a quantidade de escolhas sem ajudar a descobrir as ações.
- Boards e snapshots são conteúdo recorrente; importação por URL, exportação JSON e links externos são menos frequentes.
- O snapshot pede um nome e expõe metadados de linhagem em cada item, embora a maioria das visitas provavelmente precise apenas salvar ou restaurar.

### Workspace e chrome

- O topbar combina identidade, nome do board, estado de salvamento, export, import, tour, apresentação e configurações.
- O dock reúne ferramentas, formas, configuração de traço, apresentação, importação e histórico, além de um puxador para movê-lo.
- Propriedades de objetos já aparecem em um painel flutuante. A segunda imagem pode servir como linguagem para esse tipo de painel contextual: controles por grupos, poucos rótulos, ícones consistentes e seleção evidente.
- `DM Sans` e `Space Grotesk` dão uma personalidade geométrica. Para uma direção mais Apple, o ponto de partida é uma pilha de fontes nativas; reservar uma fonte de exibição para a marca, se necessário.

## Estrutura proposta

### Sidebar: duas áreas simples

**Workspace**

1. Cabeçalho pequeno com título do board e menu de ações (`Import`, `Export`, `Rename` ou ações equivalentes).
2. Lista de boards, com `+` alinhado ao título da seção.
3. Snapshots como seção recolhível; mostrar nome e horário curto. `Save snapshot` abre um campo compacto sob demanda.
4. Rodapé reduzido a `Help` e `About`/`Source`; remover o parágrafo promocional fixo da coluna.

**Customize**

1. **Appearance**: seletor de tema, quatro cores de destaque de sistema, disco arco-íris sem miolo para abrir o seletor de cor customizada e `More` para revelar as outras opções. Os swatches têm contorno de seleção leve e animação curta ao interagir. Grade fica no mesmo grupo.
2. **Drawing**: autocorreção de formas com um rótulo e uma descrição curta.
3. **Accessibility**: controles compactos para tamanho do texto, alto contraste e movimento reduzido. Opções menos frequentes ficam em `More accessibility options`.
4. **Advanced appearance** recolhido: posição do dock, auto-hide e cores customizadas de header, sidebar, canvas e panels, em uma lista compacta com seletor e reset por linha.

Não apagar configurações existentes antes de medir uso. Primeiro escondê-las sob `Advanced`, preservar seus valores e garantir acesso por teclado.

### Navegação e workspace

- Manter `Workspace` e `Customize` como duas abas claras, com um indicador selecionado estável. Evitar transformar cada categoria em outro nível de navegação.
- Manter `Import` em um lugar primário. Uma opção é o menu de ações do board no topbar; a sidebar pode manter apenas boards e snapshots.
- Manter export no topbar e colocar `Import board`, apresentação, painel de propriedades e tour no menu `More`. A sidebar oferece um único botão `Add to canvas` para arquivos e URLs, sem repetir exportação.
- Preservar no dock as ferramentas usadas durante criação: selecionar, mão, texto, sticky, caneta e conector. Agrupar formas em um botão e manter undo/redo visíveis.
- Mover apresentação e importação para ações secundárias, ou mostrar apresentação somente quando houver itens selecionáveis. Manter as funções disponíveis, mas reduzir o peso visual padrão.
- Abrir o painel de propriedades quando um objeto está selecionado e mostrar somente os grupos pertinentes àquele tipo. Seguir a referência 2 para cores, espessura, opacidade, camadas e ações contextuais, sem manter controles irrelevantes visíveis.

## Direção visual

| Elemento           | Referência recomendada                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonte              | Lexend como fonte de interface, com `-apple-system`, `BlinkMacSystemFont` e `Segoe UI` como fallback; títulos em peso 600, sem uma fonte display separada para cada painel |
| Texto de interface | 14 px base; rótulos de seção 12–13 px; ajuda 11–12 px; evitar texto funcional abaixo de 12 px                                                                              |
| Sidebar            | 272–288 px no desktop; padding horizontal 16 px; item de navegação com 36–40 px de altura                                                                                  |
| Espaçamento        | escala 4 / 8 / 12 / 16 / 24 px; 16–20 px entre grupos; usar divisores apenas entre áreas principais                                                                        |
| Superfícies        | branco ou cinza muito claro, borda neutra de 1 px, raio 10–12 px; sombra baixa só para painéis flutuantes                                                                  |
| Seleção            | fundo de destaque suave mais contorno/foco acessível; não depender apenas da cor                                                                                           |
| Controles          | altura 32 px para opções normais; alvos táteis de pelo menos 40 px em telas touch; swatches de 24–28 px                                                                    |
| Ícones             | Lucide 16–18 px, sempre com alinhamento e área de clique uniformes                                                                                                         |

Paleta inicial: fundo geral `#F5F5F7`, superfície `#FFFFFF`, texto principal `#1D1D1F`, texto secundário `#6E6E73`, linha `#D2D2D7`, seleção suave `#E8E8ED` e azul `#0A84FF` como destaque inicial. Preferências já salvas continuam valendo. Lexend foi escolhida para dar o aspecto mais cheio e arredondado pedido, com fontes do sistema como fallback.

## Esboço de layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ BrainShake       Nome do board                         Salvo   ⋯         │
├──────────────────────────────┬───────────────────────────────────────────┤
│ Workspace     Customize      │                                           │
│                              │                                           │
│ Boards                  +    │                 canvas                    │
│  ● Ideias                    │                                           │
│    Referências               │                                           │
│                              │                                           │
│ Snapshots               ⌄    │                                           │
│  Hoje · 14:20                │                                           │
│  Ontem · 17:05               │             [ dock de ferramentas ]       │
│                              │                                           │
│ Help                         │                                           │
└──────────────────────────────┴───────────────────────────────────────────┘

Customize:
┌───────────────────────────┐
│ Appearance                │
│ Theme              Light⌄ │
│ Accent       ● ● ● ● ● +  │
│                           │
│ Canvas                    │
│ Show grid              ●  │
│                           │
│ Accessibility             │
│ Text size       A−  A  A+ │
│ High contrast          ○  │
│ Reduce motion          ○  │
│                           │
│ Advanced appearance    ›  │
└───────────────────────────┘
```

## Mapeamento para o código

- A composição da navegação está em `src/layout/Sidebar.tsx`; o estado atual alterna `workspace` e `customize`.
- O conteúdo do customizer está em `src/layout/SidebarSettings.tsx` e `src/features/properties/AppearanceSettings.tsx`.
- As substituições de cores globais e variáveis de tema estão em `src/features/preferences/usePreferences.ts` e `src/app/App.tsx`; manter compatibilidade com o armazenamento local.
- Boards e snapshots estão em `src/features/board/components/BoardList.tsx` e `src/features/workspace/SnapshotList.tsx`.
- O cabeçalho e as ações globais estão em `src/layout/Topbar.tsx`; o dock de ferramentas está em `src/features/toolbar/Toolbar.tsx`.
- A maior parte da aparência está concentrada em `src/styles/globals.css`, com estilos de canvas em `src/styles/canvas.css`. Como há regras responsivas e overrides no fim do CSS, uma alteração futura deve consolidar as regras tocadas em vez de acrescentar outro override distante.

## Sequência segura de reconstrução

1. Ajustei a tipografia global para Lexend, com fallback para fontes do sistema, e aumentei o tamanho base da interface para 14 px.
2. Reagrupei o customizer e movi opções raras para áreas avançadas, preservando as preferências e os valores salvos.
3. Simplifiquei a sidebar de workspace, deixei snapshots recolhidos e agrupei ações secundárias no menu do topbar.
4. Reduzi o dock ao conjunto de ferramentas e histórico usados com mais frequência; ações contextuais aparecem quando há seleção.
5. Revisei as telas no navegador e alinhei sidebar, customizer, dock, menu de ações, painel contextual e tamanhos de toque à mesma escala de superfícies, bordas e controles. O seletor customizado usa um disco arco-íris e mantém o seletor de cor nativo ao clicar.

## Limite da inspeção

O SVG é uma referência conceitual da hierarquia e do tratamento visual; não representa cada ação ou estado da interface com fidelidade de pixel. A conferência foi feita no app local com dados de demonstração, e a largura mobile deve ser validada em um viewport touch real antes de publicar ajustes responsivos adicionais.
