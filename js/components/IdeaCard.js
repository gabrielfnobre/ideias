/**
 * ===============================================================================================
 * IdeaCard – CARTÃO DE UMA IDEIA NA PLATAFORMA (Feed, Listagem, Votação, Edição)
 * ===============================================================================================
 *
 * FUNÇÃO DO COMPONENTE:
 * -----------------------------------------------------------------------------
 * O IdeaCard é responsável por apresentar, de forma clara e resumida, uma ideia cadastrada
 * na plataforma, trazendo informações essenciais como:
 *    - Status (exemplo: EM TRIAGEM, APROVADA, REJEITADA...)
 *    - Título da ideia
 *    - Descrição breve
 *    - Autor
 *    - Número de votos
 *    - Ações de votação e edição (quando permitido)
 *
 * INTERAÇÕES DO USUÁRIO:
 * -----------------------------------------------------------------------------
 * - CLICANDO NO CARD: dispara a função `onClick`, passando a ideia inteira como argumento.
 * - CLICANDO NOS BOTÕES DE AÇÃO (votar/editar): NÃO abre os detalhes da ideia.
 *   (A propagação do clique é interrompida para garantir essa experiência)
 * - BOTÃO DE VOTAR: ao clicar, simplesmente executa a função `onVote` recebida por props.
 *   Não há verificação de login aqui — apenas dispara a função.
 * - BOTÃO DE EDITAR: só aparece se a função `onEdit` for fornecida via props.
 *   Ao clicar, chama `onEdit`, passando a ideia.
 * - ÁREA DE AÇÕES (votar, editar): controlada pela prop `showActions` (padrão: true).
 *
 * PROPRIEDADES (PROPS) EXPLICADAS:
 * -----------------------------------------------------------------------------
 * @param {object} idea            (OBRIGATÓRIO)
 *        A ideia a ser exibida. Espera pelo menos as seguintes propriedades:
 *        - id:          Identificador único da ideia.
 *        - title:       Título resumido da ideia.
 *        - description: Breve descrição.
 *        - status:      Status atual (usar ENUM definido no sistema, ex: 'EM_TRIAGEM').
 *        - votes:       Quantidade de votos.
 *        - author_name: Nome do autor (string).
 * @param {function} onVote        Função chamada ao clicar em votar (argumento: sem argumentos).
 * @param {function} onClick       Função chamada ao clicar no card (argumento: idea).
 * @param {function} onEdit        (Opcional) Função chamada ao clicar em editar (argumento: idea).
 * @param {boolean}  showActions   (Opcional) Se true, mostra área votar/editar. Default: true.
 *
 * ATENÇÃO SOBRE STATUS E CORES:
 * -----------------------------------------------------------------------------
 * O status da ideia determina a cor da badge no topo do card:
 *    - Se adicionar novos status no backend, lembre também de definir cores aqui!
 *
 * REGRAS DE USABILIDADE:
 * -----------------------------------------------------------------------------
 * - Nunca embuta lógica de autorização ou autenticação neste componente.
 * - Sempre use as funções recebidas via props para acionar qualquer ação.
 * - O cartão deve ser autoexplicativo e visualmente claro para qualquer pessoa.
 * - Linhas cortadas evitam "bagunça" visual, mesmo para ideias longas.
 *
 * EXEMPLO DE USO (referencial):
 * -----------------------------------------------------------------------------
 * <IdeaCard
 *    idea={objetoIdeia}
 *    onVote={() => votarNaIdeia(objetoIdeia.id)}
 *    onClick={ideia => abrirDetalhes(ideia)}
 *    onEdit={ideia => abrirModalEdicao(ideia)}
 *    showActions={true}
 * />
 */

import { Card, Badge, Button } from './ui/index.js';
import { api } from '../services/api.js';
const e = React.createElement;

export const IdeaCard = ({ idea, onVote, onClick, onEdit, showActions = true }) => {
    /**
     * statusColors:
     * -----------------------------------------------------------------------------
     * Mapeia o status da ideia para as cores dos badges (rótulos coloridos).
     * NUNCA deixe um status sem cor, pois isso gera inconsistência visual.
     */
    const statusColors = {
        'EM_ELABORACAO': 'default',
        'EM_TRIAGEM': 'info',
        'EM_AVALIACAO': 'warning',
        'APROVADA': 'success',
        'REJEITADA': 'danger'
    };
    
    /**
     * Controle de contagem de votos atualizada:
     * -----------------------------------------------------------------------------
     * Mantém um estado local para a quantidade de votos mais recente da ideia.
     * - Usa useState para guardar voteCount.
     * - Ao montar o componente (ou trocar de ideia), faz uma chamada à API para buscar
     *   a contagem de votos via api.countVotes(idea.id).
     * - Atualiza o estado com o valor retornado.
     * - O cleanup (retorno de useEffect) impede state update após desmontar.
     *
     * ISSO GARANTE QUE:
     * - Sempre mostre o número mais atual de votos ao exibir o card.
     * - O dado exibido não depende apenas do prop `idea.votes` (que pode estar desatualizado).
     * - Evita atualizações de estado indevidas se o componente desmontar rapidamente.
     */
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

    /**
     * Estrutura visual do Card:
     * - Cabeçalho: mostra o status e o ID da ideia.
     * - Corpo: título e descrição resumidos.
     * - Rodapé: informações do autor + área de ações (votar e editar).
     */
    return e(Card, { 
        className: "group hover:shadow-blue-500/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer relative",
        onClick: () => onClick(idea)
    },
        // Cabeçalho: Badge de status + id da ideia
        e('div', { className: "flex justify-between items-start mb-3" },
            e(Badge, { variant: statusColors[idea.status] || 'default' },
                idea.status.replace('_', ' ')
            ),
            e('span', { className: "text-xs font-mono text-slate-400" }, `#${idea.id}`)
        ),

        // Título (destaque) com limite de linhas, para manter o layout limpo
        e('h3', { 
            className: "text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2"
        }, idea.title),

        // Descrição (resumida e limitada no card)
        e('p', { 
            className: "text-slate-600 text-sm mb-4 line-clamp-3"
        }, idea.description),

        // Rodapé: autor + possíveis ações (votar, editar)
        e('div', { className: "flex items-center justify-between mt-auto pt-4 border-t border-slate-100" },
            // Bloco do autor (círculo com inicial + nome)
            e('div', { className: "flex items-center gap-2" },
                e('div', { 
                    className: "w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] text-white font-bold"
                },
                    idea.author_name ? idea.author_name.charAt(0) : '?'
                ),
                e('span', {
                    className: "text-xs text-slate-500 truncate max-w-[100px]"
                }, idea.author_name)
            ),
            // Área de ações: votar e editar (aparece só se showActions=true)
            showActions && e('div', { 
                className: "flex items-center gap-2", 
                onClick: (ev) => ev.stopPropagation() // NÃO deixar clicar aqui abrir detalhes!
            },
                // Botão de edição (aparece só se fornecido onEdit)
                onEdit && e('button', {
                    onClick: () => onEdit(idea),
                    className: "p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors",
                    title: "Editar Ideia"
                }, "✎"),
                // Botão de voto (sempre exibido em showActions)
                e('button', {
                    onClick: onVote,
                    className: "flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                },
                    e('span', null, "▲"),
                    e('span', { className: "text-xs font-bold" }, `${voteCount}` || 0)
                )
            )
        )
    );
};
