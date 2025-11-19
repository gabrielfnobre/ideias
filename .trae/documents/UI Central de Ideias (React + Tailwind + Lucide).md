# Objetivo
Criar a interface "Central de Ideias de Inovação" fiel à imagem, usando React (funcional), Tailwind CSS e Lucide React, com dados mockados, sombras suaves, bordas arredondadas e muito whitespace.

## Diagnóstico do Repositório
- Não há setup prévio de React/Tailwind/Lucide no diretório atual.
- Para entregar algo imediatamente visualizável sem instalar dependências, será usado um arquivo único com imports via CDN/ESM.

## Abordagem Técnica
- Entregável: um único `index.html` autônomo, pronto para abrir no navegador.
- Stack:
  - React 18 + ReactDOM via ESM CDN.
  - Tailwind via CDN (`cdn.tailwindcss.com`) configurado inline com tema custom (cores e tipografia).
  - Lucide React via ESM CDN (`esm.sh/lucide-react`).
  - Fonte "Inter" via Google Fonts.
- Vantagem: sem necessidade de build; apenas abrir o arquivo no browser.

## Paleta e Estilo
- Primárias: `white`, `gray-700/500/400`, `orange-500/400`, `teal-500/600`, `emerald-500/600`.
- Sombreamento: `shadow-sm`, `shadow`, `shadow-lg` onde apropriado; `rounded-lg/rounded-xl`.
- Whitespace generoso: `p-6`, `p-8`, `space-y-*` e `gap-*`.
- Tipografia: "Inter", fallback sans-serif.

## Estrutura de Componentes
- `AppLayout`: grid principal com coluna central ampla e sidebar direita.
- `Header`: Breadcrumb ("Central de Ideias > …"), Título "NOVA IDEIA", Subtítulo "Campanha: [Placeholder]" e metadados (Estado, Ideia, Elaborador, Nota) em um topo compacto.
- `Tabs`: duas abas ("Identificação" ativa, "Classificação"); estado visual apenas.
- `AIIndicator`: barra/alerta verde com "100% de compatibilidade com a campanha" e botão "Calcular compatibilidade".
- `IdeaForm`: campos Título (input), Campanha (dropdown/tag mock), Descrição (textarea amplo com placeholder).
- `AssistSidebar`: card "Melhore sua ideia!" com ícone de IA e lista de ações como itens clicáveis/accordion visual simples.
- `SimilarityFooter`: painel inferior fixo/overlay com título, contador de similares e dois cards lado a lado:
  - Card 1: status "EM ELABORAÇÃO" (laranja) e barra de similaridade vermelha ("Alta similaridade").
  - Card 2: status "EM ELABORAÇÃO" e barra amarela ("Média similaridade").

## Comportamentos
- Sem backend; dados mockados e labels estáticos para espelhar a imagem.
- Hovers: botões e itens com `hover:` (escurecer cor, elevar sombra, sublinhar breadcrumbs).
- Acessibilidade básica: `aria-label` em botões/ícones essenciais e semântica em headings.

## Layout e Responsividade
- Grid responsivo: `grid-cols-1 lg:grid-cols-[1fr_360px]` para sidebar em telas largas.
- `SimilarityFooter` fixo ao rodapé em telas médias/grandes; empilhado em telas muito pequenas.
- Containers com `max-w-7xl mx-auto` e espaçamento consistente.

## Dados Mockados
- Breadcrumb, campanha placeholder e metadados com valores típicos.
- Contador: "10 ideias similares encontradas".
- Conteúdo dos cards similares com título/descrição abreviados.

## Verificação
- Abrir `index.html` no navegador e validar:
  - Tipografia (Inter), cores, sombras e espaçamentos.
  - Hovers de botões/abas/itens da sidebar.
  - Barra de compatibilidade e badges de status/similaridade.
  - Responsividade em larguras comuns (sm/md/lg).

## Entrega
- Após aprovação do plano, fornecerei o código completo em um único arquivo `index.html`, contendo React + Tailwind + Lucide React e todos os componentes descritos, pronto para visualização imediata.