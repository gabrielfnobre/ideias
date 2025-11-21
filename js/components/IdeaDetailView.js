/**
 * ==============================================================================
 * IdeaDetailView – Visualização Detalhada de Ideias
 * ==============================================================================
 *
 * O QUE É ESTE COMPONENTE?
 * ------------------------------------------------------------------------------
 * IdeaDetailView exibe uma visão completa e contextualizada de uma ideia cadastrada
 * na plataforma. Ele apresenta informações detalhadas, permite interações principais
 * (votação/comentário) e mantém todas as áreas organizadas para fácil compreensão.
 *
 * RESUMO DO FUNCIONAMENTO:
 * ------------------------------------------------------------------------------
 * - Mostra informações detalhadas da ideia: status, campanha, autor, data de criação,
 *   título, descrição extensa, número total de votos e comentários.
 * - Permite votar na ideia e adicionar comentários, atualizando os dados em tempo real.
 * - Se o usuário tentar votar ou comentar sem estar autenticado, um modal de login é acionado.
 * - Inclui uma seção de "Análise da IA" ilustrativa (mockada), exibindo compatibilidade,
 *   impacto e complexidade (atualmente valores fictícios até a entrega do backend).
 * - Possui modo "modal" (sem cabeçalho de navegação e com padding ajustado) ou exibido completo.
 * - O nome do autor de comentários ainda não é fornecido pelo backend, sendo exibido como "Usuário".
 * - Os dados de votos, comentários e compatibilidade podem ser atualizados em tempo real.
 *
 * PROPRIEDADES ESPERADAS ________________________________________________________
 * @param {object}   idea         [Obrigatório] Objeto da ideia inicial. Não deve ser modificado diretamente;
 *                                updates acontecem no estado local do componente.
 * @param {function} onBack       Função chamada ao clicar em "Voltar" (para navegação). Só aparece fora do modal.
 * @param {function} onOpenAuth   Função chamada para abrir modal de autenticação quando o usuário não está logado.
 * @param {boolean}  isModal      (Opcional) Define se a visualização está em um modal; ajusta layout/cabeçalho.
 *
 * COMO FUNCIONA A ESTRUTURA DO COMPONENTE?
 * ------------------------------------------------------------------------------
 * 1. Cabeçalho de navegação (botão "Voltar") – exibido EXCETO se for modal
 * 2. Card Principal – detalhes da ideia, status, campanha, votação, autor
 * 3. Card de Análise da IA – exibido como mock; ilustra futuras funcionalidades
 * 4. Bloco de Comentários – permite cadastrar e exibir todos os comentários da ideia
 *
 * FLUXO DE INTERAÇÃO:
 * ------------------------------------------------------------------------------
 * - Votar: Ao clicar em "Votar nesta Ideia", dispara chamada para API e atualiza apenas o total de votos.
 *          Se usuário não estiver autenticado, chama o modal de login.
 * - Comentar: Usuário digita o texto, clica "Enviar" e o comentário vai para a API; a lista local de
 *             comentários é substituída pela resposta mais recente do backend.
 * - Navegação: Se for exibido fora do modal, permite voltar para tela anterior via "onBack".
 *
 * NOTAS IMPORTANTES:
 * ------------------------------------------------------------------------------
 * - NÃO há opção de edição da ideia por este componente – apenas exibição e interações permitidas.
 * - O nome do autor dos comentários é exibido como "Usuário" por limitações temporárias do backend.
 * - A análise de IA é meramente ilustrativa e será dinâmica no futuro.
 */
import { api } from '../services/api.js';
import { Card, Badge, Button } from './ui/index.js';
const e = React.createElement;

export const IdeaDetailView = ({ idea: initialIdea, onBack, onOpenAuth, isModal = false }) => {
    // Estado local que guarda os dados atualizados da ideia.
    // Sempre usar este estado para exibir dados, pois pode ser atualizado após voto ou comentário.
    const [idea, setIdea] = React.useState(initialIdea);
    const [initialVotesLoaded, setInitialVotesLoaded] = React.useState(false);

    // Armazena o texto digitado no campo de novo comentário.
    const [commentText, setCommentText] = React.useState('');

    // Indica se está ocorrendo uma operação assíncrona (ex: ao enviar comentário).
    const [loading, setLoading] = React.useState(false);

    // Como usar useEffect:
    // useEffect é um Hook do React para rodar código em determinados momentos do ciclo de vida do componente, como depois do primeiro render.
    // Exemplo abaixo: assim que o componente monta, buscamos a quantidade de votos atualizada (e só depois mostramos o número real no card).
    React.useEffect(() => {
        let ativo = true;
        async function buscarVotos() {
            try {
                // api.getIdea supõe que traz a ideia atualizada do backend
                const resp = await api.getIdea(idea.id);
                if (resp && resp.ok && ativo) {
                    setIdea(prev => ({
                        ...prev,
                        votes: resp.idea.votes
                    }));
                }
            } catch (err) {
                // Falha silenciosa
            } finally {
                if (ativo) setInitialVotesLoaded(true);
            }
        }
        buscarVotos();
        // Função de cleanup para evitar atualizar estado se componente desmontar rápido
        return () => { ativo = false }
    // O array de dependências controla quando o efeito roda. Aqui depende só do ID da ideia.
    }, [idea.id]);

    const [voteCount, setVoteCount] = React.useState(undefined);

    React.useEffect(() => {
        let ativo = true;
        async function fetchVotes() {
            const res = await api.countVotes(idea.id);
            if (ativo && typeof res !== 'undefined') {
                setVoteCount(res);
            }
        }
        fetchVotes();
        return () => { ativo = false };
    }, [idea.id]);

    // Novo useEffect para trazer a lista de comentários via listComments
    const [commentsList, setCommentsList] = React.useState([]);

    React.useEffect(() => {
        let ativo = true;
        async function fetchComments() {
            const res = [await api.listComments(idea.id)];
            if (ativo && res && Array.isArray(res)) {
                setCommentsList(res);
            }
        }
        fetchComments();
        return () => { ativo = false };
    }, [idea.id]);

    // Novo useEffect para buscar dados de usuários (autores dos comentários) usando getUserById
    const [usersList, setUsersList] = React.useState({});
    React.useEffect(() => {
        let ativo = true;
        async function fetchUsers() {
            if (!commentsList || !commentsList[0]) return;
            const userIds = Object.keys(commentsList[0]);
            const userPromises = userIds.map(uid => api.getUserById(uid));
            const results = await Promise.all(userPromises);
            if (ativo) {
                // results é um array, cada item é user (pode ser null/undefined se não achou)
                const usersObj = {};
                userIds.forEach((uid, idx) => {
                    if (results[idx]) usersObj[uid] = results[idx];
                });
                console.log(usersObj)
                setUsersList(usersObj);
            }
        }
        fetchUsers();
        return () => { ativo = false; };
    }, [commentsList]);



    /**
     * Função: handleVote
     * --------------------------------------------------------------------------
     * Tenta registrar voto na ideia via API:
     *  - Se sucesso, apenas atualiza a quantidade de votos no estado local.
     *  - Se falhar por falta de autenticação, aciona modal/popup de login.
     */
    const handleVote = async () => {
        const r = await api.vote(idea.id);
        if (r.ok) {
            setVoteCount(r.votes);
            setIdea(prev => ({ ...prev, votes: r.votes }));
        } else if (r.error === 'nao_autenticado') {
            onOpenAuth();
        }
    };

    /**
     * Função: handleComment
     * --------------------------------------------------------------------------
     * Envia o novo comentário via API:
     *  - Ignora comandos se campo estiver vazio (evita branco/acidental)
     *  - Exibe loading durante envio
     *  - Ao sucesso, substitui todos os comentários (e campos dinâmicos) pelo retorno da API,
     *    que traz a ideia processada, limpa o campo de texto.
     */
    const handleComment = async () => {
        if (!commentText.trim()) return;
        setLoading(true);
        const r = await api.comment(idea.id, commentText);
        const res = [await api.listComments(idea.id)];
        if (r.ok) {
            setCommentsList(res)
            setIdea(r.idea);
            setCommentText('');
        }
        setLoading(false);
    };

    return e('div', {
            className: `max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300 ${isModal ? '' : 'py-8'}`
        },

        // =======================
        // 1. Cabeçalho de navegação (Botão Voltar) – Exibido apenas fora de modal
        // =======================
        !isModal && e(
            'div',
            { className: "flex items-center gap-4" },
            e(Button, { variant: "ghost", onClick: onBack }, "← Voltar"),
            e('div', { className: "flex-1" })
        ),

        // =======================
        // 2. Card Principal: Detalhes da Ideia (status, campanha, título, descrição, votos, autor)
        // =======================
        e(Card, { className: "p-8" },
            e('div', { className: "flex items-start justify-between mb-6" },
                // STATUS, CAMPANHA E TÍTULO
                e('div', { className: "space-y-2" },
                    e('div', { className: "flex items-center gap-3" },
                        // Exibe o status da ideia como badge (rótulo colorido)
                        e(
                            Badge,
                            { variant: "info" },
                            idea.status.replace('_', ' ')
                        ),
                        e(
                            'span',
                            { className: "text-sm text-slate-500" },
                            `Campanha: ${idea.campaign || 'Geral'}`
                        )
                    ),
                    // Título em destaque
                    e(
                        'h1',
                        { className: "text-3xl font-bold text-slate-900" },
                        idea.title
                    )
                ),
                // Caixa de votos (total de votos destacados)
                e('div', { className: "text-center bg-blue-50 p-4 rounded-xl" },
                    e('div', { className: "text-3xl font-bold text-blue-600" },
                        voteCount || 0
                    ),
                    e('div', { className: "text-xs font-medium text-blue-400 uppercase" }, "Votos")
                )
            ),
            // Descrição completa da ideia
            e('div', { className: "prose prose-slate max-w-none mb-8" },
                e('p', { className: "text-lg text-slate-600 leading-relaxed" }, idea.description)
            ),
            // Rodapé com botão de votar e bloco de informações do autor
            e('div', { className: "flex items-center gap-4 pt-6 border-t border-slate-100" },
                // Botão de votação: Ativa função handleVote quando clicado
                e(Button, {
                    onClick: handleVote,
                    className: "gap-2"
                },
                    e('span', null, "▲"),
                    "Votar nesta Ideia"
                ),
                // Informações sobre o autor da ideia: nome, data e avatar (inicial)
                e('div', { className: "flex items-center gap-2 ml-auto" },
                    e('div', { className: "text-right" },
                        e('div', { className: "text-sm font-bold text-slate-900" }, idea.author_name),
                        e('div', { className: "text-xs text-slate-500" },
                            // Data de criação da ideia (formato local)
                            new Date(idea.created_at).toLocaleDateString()
                        )
                    ),
                    // Avatar circular com inicial do autor
                    e('div', {
                        className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold"
                    },
                        idea.author_name ? idea.author_name.charAt(0) : '?'
                    )
                )
            )
        ),

        // =======================
        // 3. Card de Análise da IA (exemplo ilustrativo)
        // =======================
        e(Card, { className: "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none" },
            e('div', { className: "flex items-center gap-3 mb-4" },
                e('span', { className: "text-2xl" }, "🤖"),
                e('h3', { className: "text-lg font-bold" }, "Análise da IA - em construção")
            ),
            // Painel mockado com 3 “métricas” fictícias
            e('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                // Compatibilidade (mock ou ideia.compat_ai)
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Compatibilidade"),
                    e('div', { className: "text-2xl font-bold text-emerald-400" }, `${idea.compat_ai || 0}%`),
                    e('div', { className: "text-xs text-slate-500" }, "Alinhamento estratégico")
                ),
                // Impacto estimado (mock fixo)
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Impacto Estimado"),
                    e('div', { className: "text-2xl font-bold text-blue-400" }, "Alto"),
                    e('div', { className: "text-xs text-slate-500" }, "Baseado em similares")
                ),
                // Complexidade (mock fixo)
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Complexidade"),
                    e('div', { className: "text-2xl font-bold text-amber-400" }, "Média"),
                    e('div', { className: "text-xs text-slate-500" }, "Tempo de implementação")
                )
            )
        ),

        // =======================
        // 4. Seção de Comentários (exibição e criação)
        // =======================
        e('div', { className: "space-y-4" },
            // Título da seção
            e('h3', { className: "text-xl font-bold text-slate-800" }, "Comentários"),
            // Área para criação de novo comentário
            e(Card, { className: "p-4" },
                e('div', { className: "flex gap-3" },
                    // Campo de texto para inserir comentário
                    e('textarea', {
                        className: "flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none",
                        placeholder: "Adicione um comentário...",
                        rows: 2,
                        value: commentText,
                        onChange: e => setCommentText(e.target.value)
                    }),
                    // Botão de envio de comentário: desabilitado se loading ou campo vazio
                    e(Button, {
                        onClick: handleComment,
                        disabled: loading || !commentText.trim()
                    }, "Enviar")
                )
            ),
            // Lista de comentários cadastrados na ideia
            Object.entries((commentsList && commentsList[0]) || {}).map(([key, value]) =>
                e(Card, { key: key, className: "p-4" },
                    e('div', { className: "flex justify-between items-start mb-2" },
                        // Nome do autor do comentário (por padrão "Usuário")
                        e('div', { className: "font-bold text-slate-700" }, `#${usersList[key]}`),
                        // Data/hora do comentário (formato local)
                        e('div', { className: "text-xs text-slate-400" }, new Date(value.created_at).toLocaleString())
                    ),
                    // Texto propriamente dito do comentário
                    e('p', { className: "text-slate-600" }, value.text)
                )
            )
        )
    );
};
