/**
 * ============================================================================
 * HomeView – FEED PRINCIPAL DE IDEIAS DA PROENG
 * ============================================================================
 *
 * OBJETIVO DESTE COMPONENTE:
 * ----------------------------------------------------------------------------
 * Este componente é a porta de entrada da plataforma de ideias. Ele exibe o feed com todas as ideias cadastradas,
 * permite que usuários filtrem (pesquisem) ideias e registrem votos. Visualiza o conteúdo de maneira simples e eficiente.
 * Não é responsável por criar, editar ou excluir ideias — apenas exibe, permite busca e votar.
 *
 * FUNCIONALIDADES PRINCIPAIS:
 * ----------------------------------------------------------------------------
 * 1. BUSCA E FILTRO INSTANTÂNEO:
 *    - O campo de busca filtra em tempo real conforme o usuário digita.
 *    - A filtragem ocorre tanto pelo título quanto pela descrição da ideia, sem diferenciação de maiúsculas/minúsculas.
 *
 * 2. VOTAÇÃO NAS IDEIAS:
 *    - Usuários podem votar em ideias diretamente pelo feed.
 *    - Se alguém tentar votar sem estar autenticado/logado, o modal de login é automaticamente disparado (via prop).
 *    - O voto é registrado através de uma chamada à API. Ao votar, atualiza apenas o contador da ideia votada no estado.
 *
 * 3. CARREGAMENTO E FEEDBACK VISUAL:
 *    - Exibe um indicador de carregamento ("Carregando ideias...") enquanto os dados são buscados.
 *    - Após carregamento, mostra a lista filtrada de ideias em um grid visual.
 *    - Caso não existam ideias, o grid ficará vazio (pode ser melhorado com mensagem, se desejar).
 *
 * 4. ORGANIZAÇÃO VISUAL:
 *    - Há uma área de destaque ("hero"), contendo um título motivacional, subtítulo e o campo de busca centralizado.
 *    - Abaixo, fica a listagem das ideias, junto a botões visuais de filtro (ainda não funcionam de verdade; são apenas interface).
 *
 * PROPS OBRIGATÓRIOS:
 * ----------------------------------------------------------------------------
 * - onOpenIdea(idea: object): Função chamada ao clicar em uma ideia do feed para abrir detalhes dela (a tela de detalhes deve estar fora deste componente!).
 * - onOpenAuth: Função chamada quando alguém tenta votar e não está autenticado. É usado para exibir o modal de autenticação/login.
 *
 * O QUE NÃO FAZ:
 * ----------------------------------------------------------------------------
 * - Não possui lógica de criação/edição/importação/exportação de ideias.
 * - Não implementa ordenações reais ("Mais Recentes", "Mais Votadas") — esses botões são visuais, devem ser implementados depois conforme a necessidade.
 *
 * EXEMPLO DE USO:
 * ----------------------------------------------------------------------------
 * <HomeView
 *    onOpenIdea={idea => mostrarDetalhes(idea)}
 *    onOpenAuth={() => setMostrarAuthModal(true)}
 * />
 *
 * QUALQUER PESSOA CONSEGUE MEXER:
 * ----------------------------------------------------------------------------
 * - Código limpo, sem pegadinhas.
 * - Busca e vota de forma direta, usa funções React para estado.
 * - Estado e efeitos bem segmentados e comentados.
 * - Qualquer alteração de lógica de filtro/voto pode ser feita apenas neste arquivo.
 */

import { api } from '../services/api.js';
import { IdeaCard } from './IdeaCard.js';
import { Button, Input } from './ui/index.js';
const e = React.createElement;

/**
 * HomeView
 * @param {Object} props
 * @param {Function} props.onOpenIdea - Recebe a ideia clicada para abrir detalhes.
 * @param {Function} props.onOpenAuth - Dispara modal de autenticação caso usuário tente votar sem login.
 */
export const HomeView = ({ onOpenIdea, onOpenAuth }) => {
    /**
     * ideas: Lista de ideias exibidas no feed.
     * Carregada uma única vez assim que o componente monta, via API.
     * Cada ideia possui (ao menos): id, title, description, votes.
     */
    const [ideas, setIdeas] = React.useState([]);

    /**
     * loading: Booleano. Indica se as ideias estão sendo buscadas.
     * Enquanto for true, mostra feedback visual "Carregando ideias...".
     */
    const [loading, setLoading] = React.useState(true);

    /**
     * filter: Valor do campo de busca.
     * Filtro digitado pelo usuário; aplicado automaticamente ao grid de ideias exibido.
     */
    const [filter, setFilter] = React.useState('');

    /**
     * useEffect – Ao montar HomeView, faz requisição para a API
     * para buscar todas as ideias registradas. Só executa uma vez (array de deps vazio).
     * Ao finalizar o carregamento (sucesso ou falha), setLoading vai para false.
     */
    React.useEffect(() => {
        (async () => {
            const r = await api.getIdeas();
            if (r.ok) setIdeas(r.ideas);
            setLoading(false);
        })();
    }, []);

    /**
     * handleVote – Função chamada quando usuário vota em uma ideia.
     * Se o back-end retornar sucesso, atualiza só a ideia votada no estado, mantendo as demais.
     * Se usuário não estiver autenticado, dispara modal de login via prop onOpenAuth.
     * Se houver outro erro (ex: API fora), mostra alerta direto.
     *
     * @param {Object} idea - Objeto da ideia a ser votada.
     */
    const handleVote = async (idea) => {
        const r = await api.vote(idea.id);
        if (r.ok) {
            setIdeas(prev =>
                prev.map(p =>
                    p.id === idea.id ? { ...p, votes: r.votes } : p
                )
            );
        } else if (r.error === 'nao_autenticado') {
            onOpenAuth(); // Solicita que usuário faça login
        } else {
            alert('Erro ao votar: ' + r.error); // Feedback direto de erro
        }
    };

    /**
     * filteredIdeas – Resultado do filtro no feed.
     * Aplica filtro do campo de busca, considerando ambos título e descrição (case insensitive).
     * Mostra todas as ideias se filtro vazio.
     */
    const filteredIdeas = ideas.filter(i =>
        i.title.toLowerCase().includes(filter.toLowerCase()) ||
        i.description.toLowerCase().includes(filter.toLowerCase())
    );

    // ===================== RENDERIZAÇÃO =======================
    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        // HERO: Título principal, mensagem inspiradora, busca centralizada
        e('div', { className: "bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6" },
            e('h1', { className: "text-4xl font-bold text-slate-900 tracking-tight" },
                "Transforme suas ideias em ",
                e('span', {
                    className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500"
                }, "Inovação")
            ),
            e('p', {
                className: "text-lg text-slate-600 max-w-2xl mx-auto"
            },
                "Compartilhe visões, colabore com colegas e ajude a construir o futuro da PROENG."
            ),
            // CAMPO DE BUSCA estilizado com ícone
            e('div', { className: "max-w-xl mx-auto relative" },
                e('input', {
                    type: "text",
                    placeholder: "Pesquisar ideias...",
                    className: "w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-lg transition-all shadow-inner",
                    value: filter,
                    onChange: e => setFilter(e.target.value)
                }),
                // Ícone de busca (apenas decorativo)
                e('span', {
                    className: "absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400"
                }, "🔍")
            )
        ),

        // LISTA DAS IDEIAS
        e('div', { className: "space-y-4" },
            // Barra topo: título e botões de filtro visual (sem ação real por enquanto)
            e('div', { className: "flex items-center justify-between" },
                e('h2', {
                    className: "text-xl font-bold text-slate-800"
                }, "Ideias Recentes"),
                e('div', { className: "flex gap-2" },
                    // Estes botões são só interface visual/pronta para ação
                    e(Button, {
                        variant: "ghost",
                        className: "text-sm"
                    }, "Mais Recentes"),
                    e(Button, {
                        variant: "ghost",
                        className: "text-sm"
                    }, "Mais Votadas")
                )
            ),

            // Estado visual de carregamento enquanto busca ideias
            loading
                ? e('div', {
                    className: "text-center py-12 text-slate-400"
                }, "Carregando ideias...")
                : (
                    // Grid das ideias (aplica filtro)
                    e('div', {
                        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    },
                        filteredIdeas.map(idea =>
                            e(IdeaCard, {
                                key: idea.id,
                                idea,
                                onClick: onOpenIdea,
                                /**
                                 * Handler de votação da ideia
                                 * Intercepta o clique no botão de voto, impede propagação para card
                                 * e executa a lógica de votação definida acima.
                                 * @param {Event} ev
                                 */
                                onVote: (ev) => {
                                    ev.stopPropagation();
                                    handleVote(idea);
                                }
                            })
                        )
                    )
                )
        )
    );
};
