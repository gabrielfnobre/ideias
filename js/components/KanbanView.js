/**
 * ===============================================================================================
 * KanbanView – QUADRO DE IDEIAS NO FORMATO KANBAN (TRELLO/JIRA STYLE) – SUPER DOCUMENTADO
 * ===============================================================================================
 *
 * O QUE É ESTE COMPONENTE?
 * -----------------------------------------------------------------------------------------------
 * É o quadro Kanban do sistema: exibe todas as ideias organizadas em colunas conforme o status.
 * Cada coluna representa um status do fluxo da ideia e mostra os cartões de acordo.
 * Usuários podem arrastar e soltar ideias entre colunas para alterar seus status de forma fácil.
 *
 * COMO FUNCIONA?
 * -----------------------------------------------------------------------------------------------
 * - As ideias são carregadas da API, separadas por status e exibidas em colunas lado a lado (horizontal).
 * - Cada ideia vira um card (IdeaCard). Ao clicar, abre um modal com detalhes completos (IdeaDetailView).
 * - A movimentação entre colunas é feita via drag and drop:
 *     - Arraste o card da ideia para outra coluna para mudar o status.
 *     - Ao soltar, o status já muda visualmente e depois a API é chamada para confirmar a atualização.
 *     - Se houver erro na API, o status volta para o original e o usuário é notificado.
 * - NÃO HÁ VOTAÇÃO DIRETA NO QUADRO!
 *     - Para votar/comentar/detalhar, clique no card e use o modal (IdeaDetailView), para garantir controle e
 *       consistência dos dados.
 * - Sempre que um status é alterado ou fecha o modal de detalhes, a lista é recarregada para ficar atualizada.
 *
 * PRINCIPAIS VARIÁVEIS DE ESTADO (STATE):
 * -----------------------------------------------------------------------------------------------
 * - ideas: Lista de todas as ideias carregadas da API.
 * - loading: Indica se está carregando as ideias (pode ser usado para spinner, caso queira).
 * - selectedIdea: A ideia atualmente selecionada (para ver detalhes no modal).
 * - draggedIdea: A ideia que está sendo arrastada no momento (para gerenciar drag & drop).
 *
 * PROPS SUPORTADAS:
 * -----------------------------------------------------------------------------------------------
 * - onOpenAuth: Função que deve ser chamada caso seja preciso abrir o modal de autenticação.
 *
 * COMO PERSONALIZAR/ADAPTAR ESTE KANBAN?
 * -----------------------------------------------------------------------------------------------
 * - Para adicionar/remover status (colunas), edite o array "columns" logo abaixo.
 * - As cores, títulos e ordens das colunas são todos definidos ali.
 * - NÃO coloque lógica de ação direta em cards: tudo deve acontecer nos detalhes da ideia.
 *
 * ENTROU AGORA? DICA: LEIA OS COMENTÁRIOS DOS MÉTODOS, CADA FUNÇÃO ESTÁ EXPLICADA EM PORTUGUÊS CLARO.
 */
import { api } from '../services/api.js';
import { IdeaCard } from './IdeaCard.js';
import { IdeaDetailView } from './IdeaDetailView.js';
import { Modal, Input, Button } from './ui/index.js';
const e = React.createElement;

export const KanbanView = ({ onOpenAuth }) => {

    // ======================== ESTADOS LOCAIS ========================
    // Lista de ideias carregadas da API
    const [ideas, setIdeas] = React.useState([]);
    // Carregamento visual (pode ser usado para spinner caso amplie)
    const [loading, setLoading] = React.useState(false);
    // Qual ideia está selecionada para detalhar (abre modal)
    const [selectedIdea, setSelectedIdea] = React.useState(null);
    // Qual ideia está sendo arrastada via drag and drop
    const [draggedIdea, setDraggedIdea] = React.useState(null);

    /**
     * =========================
     * Função: load
     * -------------------------------------------------------------
     * Busca a lista de ideias na API e atualiza o estado local.
     * Sempre chame isso sempre que algum dado pode ter mudado
     * (após mudar status, votar, comentar, fechar modal, etc).
     * =========================
     */
    const load = async () => {
        const r = await api.getIdeas();
        if (r.ok) setIdeas(r.ideas);
    };

    /**
     * =========================
     * useEffect de Montagem
     * -------------------------------------------------------------
     * Executa load() assim que o componente é montado para garantir
     * que sempre mostre as ideias mais recentes.
     * =========================
     */
    React.useEffect(() => {
        load();
    }, []);

    /**
     * =========================
     * handleDragStart
     * -------------------------------------------------------------
     * Quando o usuário começa a arrastar um card, salva a ideia em
     * draggedIdea e define o tipo de ação do drag & drop (move).
     * =========================
     * @param {DragEvent} ev   Evento de drag do navegador
     * @param {Object} idea    Objeto da ideia sendo arrastada
     */
    const handleDragStart = (ev, idea) => {
        setDraggedIdea(idea);
        ev.dataTransfer.effectAllowed = 'move';
        // Dica: Aqui daria para customizar o visual do card fantasma no futuro.
    };

    /**
     * =========================
     * handleDragOver
     * -------------------------------------------------------------
     * Necessário para habilitar o drop: impede o default do navegador
     * e define o efeito visual de movimento.
     * =========================
     * @param {DragEvent} ev
     */
    const handleDragOver = (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
    };

    /**
     * =========================
     * handleDrop
     * -------------------------------------------------------------
     * Quando solta o card numa coluna. Atualiza o status localmente
     * (optimista), chama a API, e se der erro, reverte automaticamente.
     * Protege de tentativas inválidas (ex: arrastar para o mesmo status).
     * =========================
     * @param {DragEvent} ev
     * @param {string} newStatus Cód. do novo status destino da coluna
     */
    const handleDrop = async (ev, newStatus) => {
        ev.preventDefault();
        if (!draggedIdea || draggedIdea.status === newStatus) return;

        const oldStatus = draggedIdea.status;

        // Atualiza localmente para já dar feedback visual
        setIdeas(prev => prev.map(i =>
            i.id === draggedIdea.id ? { ...i, status: newStatus } : i
        ));

        // Chama API para efetivar mudança
        try {
            await api.updateStatus(draggedIdea.id, newStatus);
        } catch (error) {
            // Deu erro? Volta ao estado anterior e avisa usuário.
            setIdeas(prev => prev.map(i =>
                i.id === draggedIdea.id ? { ...i, status: oldStatus } : i
            ));
            alert('Erro ao mover ideia. Tente novamente.');
        }
        setDraggedIdea(null);
    };

    /**
     * =========================
     * COLUMNS – CONFIGURAÇÃO DAS COLUNAS DO KANBAN
     * -------------------------------------------------------------
     * Cada item é uma coluna:
     *   - id:        identificador da coluna/status
     *   - label:     nome que aparece como título da coluna
     *   - color:     classes de cor para fundo/borda (customize aqui!)
     * =============================================================
     * Quer mudar as etapas/status do seu fluxo? Altere aqui!
     */
    const columns = [
        { id: 'EM_ELABORACAO', label: 'Em Elaboração', color: 'bg-slate-50 border-slate-200' },
        { id: 'EM_TRIAGEM', label: 'Triagem', color: 'bg-blue-50/50 border-blue-100' },
        { id: 'EM_AVALIACAO', label: 'Em Avaliação', color: 'bg-amber-50/50 border-amber-100' },
        { id: 'APROVADA', label: 'Aprovada', color: 'bg-emerald-50/50 border-emerald-100' },
        { id: 'REJEITADA', label: 'Rejeitada', color: 'bg-rose-50/50 border-rose-100' }
    ];

    // =========================
    // RENDERIZAÇÃO DO COMPONENTE
    // =========================
    return e('div', {
        // Container geral do Kanban. Altura ajustada para caber sob o header, scroll vertical/horizontal responsivo.
        className: "h-[calc(100vh-140px)] overflow-y-auto md:overflow-x-auto pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
    },
        // ================================
        // ÁREA PRINCIPAL DO KANBAN – Colunas lado a lado
        // ================================
        e('div', {
            className: "flex flex-col md:flex-row gap-6 h-full min-w-full md:min-w-[1200px]"
        },
            columns.map(col =>
                e('div', {
                    key: col.id,
                    className: [
                        "flex-1 flex flex-col",
                        col.color,
                        "border rounded-2xl p-4 transition-colors min-h-[500px] md:min-h-0",
                        draggedIdea ? "ring-2 ring-blue-500/20 border-blue-300 border-dashed" : ""
                    ].join(' '),
                    onDragOver: handleDragOver,
                    onDrop: (ev) => handleDrop(ev, col.id)
                },
                    // ==== Cabeçalho da Coluna ====
                    e('div', { className: "flex items-center justify-between mb-4 px-1" },
                        e('h3', { className: "font-bold text-slate-700" }, col.label),
                        e('span', {
                            className: "bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm"
                        },
                            // Quantidade de ideias naquela coluna/status
                            ideas.filter(i => i.status === col.id).length
                        )
                    ),
                    // ==== Cartões de Ideia (Cards) ====
                    e('div', {
                        className: "flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar"
                    },
                        ideas
                            .filter(i => i.status === col.id)
                            .map(i =>
                                e('div', {
                                    key: i.id,
                                    draggable: true,
                                    onDragStart: (ev) => handleDragStart(ev, i),
                                    className: "cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-1"
                                },
                                    e(IdeaCard, {
                                        idea: i,
                                        onClick: () => setSelectedIdea(i),
                                        // Ao clicar, só abre detalhes! NÃO VOTE DIRETO AQUI!
                                        onVote: (ev) => { ev.stopPropagation(); },
                                        // Não mostre ações extras direto no card. Tudo deve ser feito via modal.
                                        showActions: false
                                    })
                                )
                            )
                    )
                )
            )
        ),

        // ===============================================
        // MODAL DE DETALHE DA IDEIA (ABRE AO CLICAR NO CARD)
        // ===============================================
        selectedIdea && e(Modal, {
            isOpen: !!selectedIdea,
            // Ao fechar o modal, limpa a seleção E recarrega as ideias para atualizar status, votos, comentários etc.
            onClose: () => { setSelectedIdea(null); load(); },
            title: null // O título do modal vem do próprio IdeaDetailView
        },
            e('div', {
                className: "max-h-[80vh] overflow-y-auto custom-scrollbar -m-6 p-6"
            },
                e(IdeaDetailView, {
                    idea: selectedIdea,
                    onOpenAuth,
                    isModal: true,
                    // Permitindo voltar para o quadro apenas fechando o modal
                    onBack: () => setSelectedIdea(null)
                })
            )
        )
    );
};
