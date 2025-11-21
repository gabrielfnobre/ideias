/**
 * ============================================================================================
 * RewardsView – LOJA DE RECOMPENSAS VISUAL (entenda TUDO sobre o componente lendo este bloco)
 * ============================================================================================
 *
 * SOBRE O QUE É ESTE COMPONENTE?
 * -----------------------------------------------------------------------------
 * Este componente simula uma loja de recompensas, permitindo que usuários
 * vejam e "troquem" seus pontos acumulados (ganhos por participação na
 * plataforma de ideias) por prêmios/experiências sugeridos pela empresa.
 *
 * O QUE ELE FAZ DE VERDADE?
 * -----------------------------------------------------------------------------
 * - Exibe de forma clara e amigável:
 *    1. O saldo atual de pontos do usuário.
 *    2. Uma coleção de recompensas possíveis, com todos os detalhes.
 * - Mostra um banner no topo explicando o funcionamento e ressaltando
 *   a quantidade de pontos acumulados.
 * - Para cada recompensa, apresenta um cartão visual rico com:
 *   - Imagem ilustrativa do prêmio
 *   - Título e descrição detalhada
 *   - O custo (em pontos) para resgatar aquele item
 *   - Botão para "resgatar", que ativa ou desativa conforme a pontuação.
 * - NÃO realiza nenhuma transação real nem chama APIs de verdade.
 *
 * REGRAS DE FUNCIONAMENTO (o que esperar ao editar ou utilizar):
 * -----------------------------------------------------------------------------
 * - NÃO coloque lógica de resgate real, navegação ou autenticação aqui.
 *   Este componente serve só para apresentar os dados e a interface.
 * - Toda a lista de recompensas está fixa em um array logo no começo do componente.
 *   É fácil adicionar, remover ou editar itens (veja o array `rewards` abaixo).
 * - O botão de resgatar só fica ativado se o usuário tiver pontos suficientes.
 *   Caso contrário, ele mostra quantos pontos ainda faltam, já calculado.
 * - Não tem navegação nem feedback interativo além do visual do botão.
 * - O visual é moderno, colorido e bem-disposto: pode abrir, ler e entender
 *   mesmo sem ser programador.
 *
 * COMO USAR/EDITAR/ADAPTAR (passo a passo):
 * -----------------------------------------------------------------------------
 * 1. Para informar quantos pontos o usuário possui, passe o valor via prop `userPoints`:
 *
 *       <RewardsView userPoints={350} />
 *
 *    Se não passar nada, começa em 0.
 *
 * 2. Para alterar as recompensas mostradas, modifique diretamente o array `rewards`
 *    dentro deste componente (lá embaixo). Cada item tem:
 *      - id:            (único, só pra evitar bugs no React)
 *      - title:         Nome da recompensa no cartão
 *      - cost:          Quantos pontos custam para resgatar
 *      - image:         URL de uma imagem ilustrativa (serve de inspiração)
 *      - desc:          Descrição explicando o que é o prêmio
 *
 * 3. Não precisa alterar nada para o cálculo do botão. Ele já verifica a pontuação disponível
 *    e calcula o quanto falta, se necessário.
 *
 * 4. O visual de cada cartão e do banner principal já está estilizado para ser agradável
 *    tanto em desktop quanto em tela pequena (usando classes de utilidades tailwind).
 *    Nada impede de mudar as cores/classe/copy do texto conforme quiser.
 *
 * 5. O componente é totalmente isolado – zero dependências de API, navegação, login etc.
 *    Pode embutir em qualquer página para inspirar, demonstrar gamificação
 *    ou simular a loja no protótipo do produto.
 *
 * ATENÇÃO:
 * -----------------------------------------------------------------------------
 * - Toda funcionalidade neste componente é visual/explicativa.
 * - Remova ou adapte este bloco de documentação caso mude o funcionamento!
 */

import { Card, Button, Badge } from './ui/index.js';
const e = React.createElement;

/**
 * RewardsView
 * ------------------------------------------------------------------------------------------------
 * Apresenta a loja de recompensas gamificada da empresa.
 *
 * @param {number} userPoints - Quantidade de pontos de inovação que o usuário possui (default: 0).
 *
 * Exemplo de uso:  <RewardsView userPoints={750} />
 *
 * VISÃO GERAL DA INTERFACE:
 *    - Banner no topo mostrando tema e pontos.
 *    - Grade de cartões, cada qual apresenta:
 *       * Imagem
 *       * Nome do prêmio
 *       * Descrição
 *       * Custo (pontos)
 *       * Botão de resgate (habilitado/desabilitado conforme saldo)
 */
export const RewardsView = ({ userPoints = 0 }) => {
    /**
     * rewards
     * -------------------------------------------------------------------------------------------
     * Lista das recompensas disponíveis para o usuário trocar pontos.
     * Para adicionar/remover/editar, basta mexer neste array.
     * Todos os campos são autoexplicativos:
     *   - id:    identificador único interno do prêmio
     *   - title: nome que aparece no cartão
     *   - cost:  custo em pontos para trocar
     *   - image: URL de uma imagem ilustrativa
     *   - desc:  explicação clara do prêmio
     */
    const rewards = [
        {
            id: 1,
            title: "Almoço com o CEO",
            cost: 500,
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80",
            desc: "Um almoço exclusivo para apresentar suas ideias diretamente à diretoria."
        },
        {
            id: 2,
            title: "Day Off (Folga)",
            cost: 1000,
            image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80",
            desc: "Um dia inteiro de folga para você recarregar as energias."
        },
        {
            id: 3,
            title: "Voucher Livraria",
            cost: 200,
            image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80",
            desc: "R$ 100,00 em livros técnicos ou de lazer."
        },
        {
            id: 4,
            title: "Curso Online Premium",
            cost: 800,
            image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
            desc: "Acesso a um curso de especialização na sua área."
        },
        {
            id: 5,
            title: "Kit Home Office",
            cost: 1500,
            image: "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=400&q=80",
            desc: "Upgrade no seu setup: Teclado mecânico, mouse e suporte."
        },
        {
            id: 6,
            title: "Ingresso para Conferência",
            cost: 1200,
            image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&q=80",
            desc: "Participação em um evento de tecnologia ou inovação."
        }
    ];

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },

        /**
         * BANNER PRINCIPAL DA LOJA
         * -------------------------------------------------------------------------------
         * - Mostra o nome/tema da loja e enfatiza o saldo de pontos atual do usuário.
         * - Possui um fundo gradiente chamativo, texto explicativo e destaque em pontos
         *   acumulados, para motivar a participação.
         * - Elementos decorativos no fundo são puramente visuais (zero impacto funcional).
         */
        e('div', { className: "relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-blue-500/20" },
            e('div', { className: "relative z-10 flex flex-col md:flex-row items-center justify-between gap-6" },
                // Título da loja + texto convidativo explicando a proposta
                e('div', null,
                    e('h2', { className: "text-3xl font-bold mb-2" }, "Loja de Recompensas"),
                    e('p', { className: "text-blue-100 max-w-xl" },
                        "Troque seus pontos de inovação por experiências incríveis e prêmios exclusivos. Continue colaborando para ganhar mais!"
                    )
                ),
                // Box com saldo de pontos do usuário, bem destacado visualmente
                e('div', { className: "bg-white/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[150px]" },
                    e('div', { className: "text-xs font-medium text-blue-100 uppercase tracking-wider" }, "Seus Pontos"),
                    e('div', { className: "text-4xl font-bold" }, userPoints)
                )
            ),
            // Círculos decorativos para dar modernidade e suavidade ao fundo (não afetam lógica)
            e('div', { className: "absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" }),
            e('div', { className: "absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" })
        ),

        /**
         * GRADE DE RECOMPENSAS (cartões de prêmios)
         * -------------------------------------------------------------------------------
         * - Mostra todas as recompensas disponíveis, cada uma em um cartão separado.
         * - O grid se adapta conforme o tamanho da tela (mobile = 1 coluna; desktop até 3).
         * - Cada cartão de recompensa exibe:
         *   1. Imagem ilustrativa do prêmio no topo.
         *   2. Badge mostrando o custo em pontos, sempre visível e chamativo.
         *   3. Título e descrição compreensíveis.
         *   4. Botão "Resgatar":
         *      - Ativo se o usuário tiver pontos suficientes.
         *      - Desabilitado se não tiver pontos — mostra quantos faltam.
         */
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
            rewards.map(item =>
                e(Card, {
                    key: item.id,
                    className: "flex flex-col h-full p-0 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                },
                    // TOPO DO CARTÃO: imagem premiada + badge do custo
                    e('div', { className: "h-48 overflow-hidden relative" },
                        e('img', {
                            src: item.image,
                            alt: item.title,
                            className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        }),
                        // Badge de custo (pontos necessários), sempre fixo no canto direito superior
                        e('div', { className: "absolute top-3 right-3" },
                            e(Badge, { variant: "info" }, `${item.cost} pts`)
                        )
                    ),
                    // CORPO DO CARTÃO: título, explicação e botão
                    e('div', { className: "p-6 flex flex-col flex-1" },
                        e('h3', { className: "text-lg font-bold text-slate-800 mb-2" }, item.title),
                        e('p', { className: "text-sm text-slate-600 mb-6 flex-1" }, item.desc),
                        /**
                         * Botão de resgate:
                         *   - Ativo (variant: "primary") somente se usuário tem pontos suficientes.
                         *   - Desativado ("secondary" e `disabled`) indica quantos pontos faltam.
                         */
                        e(Button, {
                            variant: userPoints >= item.cost ? 'primary' : 'secondary',
                            disabled: userPoints < item.cost,
                            className: "w-full"
                        }, userPoints >= item.cost ? "Resgatar" : `Faltam ${item.cost - userPoints} pts`)
                    )
                )
            )
        )
    );
};
