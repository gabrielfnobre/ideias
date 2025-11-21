/**
 * =====================================================================================
 * ARQUIVO PRINCIPAL DO APP (App.js) — EXPLICAÇÃO DETALHADA PARA QUALQUER PESSOA
 * =====================================================================================
 *
 * SOBRE O QUE É ESTE ARQUIVO?
 * -----------------------------------------------------------------------------
 * Este arquivo é o ponto de entrada principal da aplicação React do sistema de ideias e inovação.
 * Ele organiza toda a lógica de navegação (qual tela está ativa), autenticação, exibição de modais,
 * controle de usuário logado, e inclui todos os componentes visuais do topo até o rodapé.
 *
 * COMO FUNCIONA NA PRÁTICA?
 * -----------------------------------------------------------------------------
 * - O componente principal se chama App.
 * - Utiliza React.useState para guardar informações fundamentais:
 *      - user: informações do usuário autenticado (ou null se não estiver logado).
 *      - view: controla qual tela está sendo exibida no momento ("Home", "Dashboard", etc).
 *      - authOpen: indica se a modal de autenticação (login/cadastro) está aberta.
 *      - createOpen: indica se a modal de criar nova ideia está aberta.
 *      - selectedIdea: guarda uma ideia específica escolhida para detalhamento (quando abre detalhes).
 * - Utiliza React.useEffect para ler os dados do usuário salvos no navegador assim que o app inicia.
 * - Inclui funções para fazer login, logout, abrir/criar ideias, abrir a modal de autenticacao na hora certa.
 * - A função renderView() decide o que mostrar no centro (Home, Dashboard, Kanban, Detalhe da Ideia, etc).
 * - Todos os principais blocos visuais (header, conteúdo central, modais) são conectados aqui.
 *
 * ESTRUTURA E RESPONSABILIDADES
 * -----------------------------------------------------------------------------
 * - O <Header /> recebe funções e dados necessários para mostrar informações do usuário e permitir trocar de tela.
 * - O <main> exibe dinamicamente a tela escolhida via renderView().
 * - <AuthModal /> e <CreateIdeaModal /> são modais globais controladas por seus próprios estados.
 * - Ao criar uma nova ideia com sucesso, o app recarrega a página se estiver na Home ou Kanban,
 *   garantindo que o novo conteúdo apareça, de forma simples (sem lógica complicada de atualização em tempo real).
 *
 * COMO ALTERAR OU PERSONALIZAR
 * -----------------------------------------------------------------------------
 * - Para adicionar novas telas/rotas, basta acrescentar mais cases no switch da função renderView().
 * - Para mudar a navegação padrão ao sair, altere o que é feito dentro de handleLogout().
 * - A comunicação entre componentes é feita sempre via props e estados (state do React).
 * - Os modais podem ser chamados de qualquer lugar da interface via as funções de abrir/modificar seus estados.
 *
 * DETALHES DE IMPLEMENTAÇÃO
 * -----------------------------------------------------------------------------
 * - Todo o código usa React puro (sem hooks especiais/typescript/etc) para ser compreensível por todos.
 * - Usa a variável e (abreviação para React.createElement) para criar os elementos React (sintaxe funcional, moderna).
 * - O App roda dentro do elemento #root (conforme padrão de apps React).
 *
 * QUALQUER PESSOA CONSEGUE:
 * - Ler o fluxo inteiro do app de cima pra baixo.
 * - Visualizar qual bloco/tela está sendo exibido e por quê.
 * - Entender a ligação entre ações do usuário (login, logout, criar ideia, navegar).
 * - Adaptar para suas necessidades sem precisar ser um engenheiro de software avançado.
 */

// Importa todos os componentes e utilidades necessários para criar a interface e a lógica do app.
import { api } from './services/api.js';
import { Header } from './components/Header.js';
import { HomeView } from './components/HomeView.js';
import { DashboardView } from './components/DashboardView.js';
import { KanbanView } from './components/KanbanView.js';
import { CampaignsView } from './components/CampaignsView.js';
import { IdeaDetailView } from './components/IdeaDetailView.js';
import { RewardsView } from './components/RewardsView.js';
import { AuthModal } from './components/AuthModal.js';
import { CreateIdeaModal } from './components/CreateIdeaModal.js';

// Atalho para simplificar a criação de elementos React (ao invés de usar JSX direto)
const e = React.createElement;

/**
 * COMPONENTE PRINCIPAL DA APLICAÇÃO
 * 
 * Responsável por:
 * - Gerenciar estados globais (usuário, tela atual, modais abertas, ideia selecionada)
 * - Decidir qual tela principal exibir de acordo com a navegação
 * - Controlar abertura e fechamento das modais (autenticação e cadastro de ideia)
 * - Fornecer as funções de apoio (login, logout, etc) para os componentes filhos quando necessário
 */
const App = () => {
    // =========================
    // ESTADOS GLOBAIS DO APLICATIVO
    // =========================

    // Dados do usuário autenticado (null se não estiver logado)
    const [user, setUser] = React.useState(null);

    // Qual tela está sendo exibida no momento (Home, Kanban, Dashboard, etc)
    const [view, setView] = React.useState('Home');

    // Controle de exibição da modal de autenticação (login/cadastro)
    const [authOpen, setAuthOpen] = React.useState(false);

    // Controle de exibição da modal de criação de novas ideias
    const [createOpen, setCreateOpen] = React.useState(false);

    // Qual ideia está selecionada para mostrar os detalhes (usada na IdeaDetailView)
    const [selectedIdea, setSelectedIdea] = React.useState(null);

    // =========================
    // EFETUA LOGIN AUTOMÁTICO SE TIVER USER NO LOCALSTORAGE (AUTOLOGIN)
    // =========================
    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);


    // =========================
    // FUNÇÃO: Faz login do usuário
    // - Salva usuário no estado e localStorage para lembrar no futuro
    const handleLogin = (u) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
    };

    // =========================
    // FUNÇÃO: Faz logout do usuário
    // - Remove do estado e localStorage
    // - Retorna sempre para a tela principal (Home)
    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('user');
        setView('Home');
    };

    // =========================
    // FUNÇÃO: Ao clicar para criar nova ideia
    // - Se não estiver logado, abre modal de autenticação primeiro
    // - Se já logado, abre modal de criação normalmente
    const handleCreateClick = () => {
        if (!user) {
            setAuthOpen(true);
        } else {
            setCreateOpen(true);
        }
    };

    // =========================
    // FUNÇÃO: Decide qual tela principal mostrar de acordo com o estado "view"
    // - Adiciona as props necessárias para cada componente/tela
    // - Quando abre detalhes de uma ideia, passa a ideia selecionada e uma função de 'voltar'
    const renderView = () => {
        // Props comuns para páginas que aceitam abrir a modal de login quando usuário não está autenticado
        const commonProps = { onOpenAuth: () => setAuthOpen(true) };

        switch (view) {
            case 'Home':
                // HomeView recebe: função para abrir detalhes de uma ideia ao clicar
                return e(HomeView, {
                    ...commonProps,
                    onOpenIdea: (idea) => { setSelectedIdea(idea); setView('IdeaDetail'); }
                });
            case 'Dashboard':
                return e(DashboardView);
            case 'Kanban':
                return e(KanbanView, commonProps);
            case 'Campanhas':
                return e(CampaignsView);
            case 'Recompensas':
                // A tela de recompensas recebe a pontuação atual do usuário (ou zero se não logado)
                return e(RewardsView, { userPoints: user ? user.points : 0 });
            case 'IdeaDetail':
                // Tela de detalhes recebe a ideia selecionada, função para voltar, e opção para chamar login
                return e(IdeaDetailView, {
                    ...commonProps,
                    idea: selectedIdea,
                    onBack: () => setView('Home')
                });
            default:
                // Padrão: mostra Home
                return e(HomeView, commonProps);
        }
    };

    // =========================
    // STRUCTURA VISUAL PRINCIPAL DO APP
    // - Header fixo
    // - Conteúdo principal dentro de <main>
    // - Modais globais (login/cadastro e criação de ideia)
    return e('div', {
            className: "min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100"
        },
        // Cabeçalho de navegação (exibe usuário, botões, troca de telas)
        e(Header, {
            user,
            onLogout: handleLogout,
            onOpenAuth: () => setAuthOpen(true),
            currentView: view,
            setView: setView,
            onCreateIdea: handleCreateClick
        }),

        // Conteúdo principal (centralizado, com padding bonito)
        e('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
            renderView()
        ),

        // Modal global de autenticação (login/cadastro)
        e(AuthModal, {
            isOpen: authOpen,
            onClose: () => setAuthOpen(false),
            onSuccess: handleLogin // Quando login/cadastro der certo, registra usuário logado
        }),

        // Modal global para criação de nova ideia
        e(CreateIdeaModal, {
            isOpen: createOpen,
            onClose: () => setCreateOpen(false),
            onSuccess: () => {
                /**
                 * Quando uma nova ideia é criada com sucesso:
                 *  - Se estiver nas telas "Home" ou "Kanban", recarrega a página para mostrar a nova ideia.
                 *  - Em apps profissionais, o correto seria atualizar só os dados necessários (sem reload),
                 *    mas aqui simplifica para garantir que sempre aparece a nova ideia.
                 */
                if (view === 'Home' || view === 'Kanban') {
                    window.location.reload();
                }
            }
        })
    );
};

// Inicializa o app React no elemento #root da página HTML.
// A partir daqui, todos os componentes, navegação e lógica passam a funcionar.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
