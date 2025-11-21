/**
 * ==========================================================
 * CampaignsView – LISTA E APRESENTA TODAS AS CAMPANHAS
 * ==========================================================
 * 
 * FINALIDADE DESTE COMPONENTE:
 * ------------------------------------
 * Exibe, de maneira visualmente organizada, todas as campanhas de inovação cadastradas no sistema.
 * Cada campanha é mostrada em um "cartão" (Card), detalhando seus principais atributos: status (ex: ATIVA),
 * data limite, título e descrição.
 * 
 * COMO FUNCIONA?
 * ----------------------------------------------------------
 * 1. Quando o componente é montado (ou seja, aparece na tela), ele faz uma requisição para a API buscar a lista atualizada de campanhas.
 *    - Se receber um prop "campaigns" na hora de criar o componente, mostra primeiro esses dados enquanto a requisição não chega.
 *    - Assim que a resposta da API chega, ATUALIZA imediatamente a lista para os dados reais do backend.
 *    - Sempre prioriza os dados vindos da API para garantir que tudo exibido está atualizado.
 *
 * 2. Cada campanha aparece em formato de card, com destaque visual para o status (ex.: "ATIVA" em verde).
 *    - Mostra também data limite para envio de ideias.
 *    - Título em destaque e uma breve descrição.
 *    - No rodapé do card há:
 *      a) Avatares "fakes" como espaço reservado para futuros usuários/participantes.
 *      b) Um botão "Ver Ideias", apenas para efeito visual (NÃO possui ação funcional implementada aqui).
 *
 * 3. O topo da página mostra o título geral e um botão "+ Nova Campanha" (BOTÃO VISUAL APENAS – não abre formulário nem nada).
 *
 * O QUE ESTE COMPONENTE NÃO FAZ?
 * ----------------------------------------------------------
 * - NÃO implementa lógica de criação de campanhas.
 * - NÃO lida com edição ou remoção de campanhas.
 * - NÃO implementa navegação/ação de ver ideias (isso deve ser feito em outro componente).
 *
 * QUANDO USAR:
 * ----------------------------------------------------------
 * Quando quiser mostrar a lista de campanhas para o usuário, sempre usando os dados mais atuais do backend.
 *
 * PROPS ESPERADAS:
 * ----------------------------------------------------------
 * - campaigns (opcional): uma lista inicial de campanhas, que serve só para a tela não ficar vazia antes da resposta da API.
 *   Assim que a API responde, a lista é atualizada. Se não passar nada, começa vazio e logo preenche.
 *
 * ESTRUTURA DOS DADOS DE UMA CAMPANHA (exemplo):
 * {
 *   id: number,                // identificador único da campanha
 *   title: string,             // título da campanha
 *   description: string,       // descrição breve
 *   deadline: string (yyyy-mm-dd),    // data fim de submissão de ideias
 *   status: string ("ATIVA" ou outro),
 *   ... (podem existir outros campos)
 * }
 *
 * DICA:
 * ----------------------------------------------------------
 * Mantenha a lógica deste componente SÓ para exibição/listagem.
 * Se for implementar novas features (como edição/criação), crie outros componentes para isso!
 */

import { api } from '../services/api.js';
import { Card, Badge, Button } from './ui/index.js';
const e = React.createElement;

export const CampaignsView = ({ campaigns: initialCampaigns }) => {
    // Estado interno que armazena as campanhas mais recentes vindas da API.
    // Se receber uma lista inicial, usa apenas enquanto a API não responde.
    const [campaigns, setCampaigns] = React.useState(initialCampaigns || []);

    // useEffect: Executa apenas uma vez, ao montar o componente.
    // Busca a lista de campanhas diretamente na API para garantir frescor dos dados.
    React.useEffect(() => {
        (async () => {
            const r = await api.getCampaigns(); // Chama API
            if (r.ok) setCampaigns(r.campaigns); // Atualiza lista de campanhas na tela
        })();
        // OBS: Não fica ouvindo por mudanças em initialCampaigns, pois a fonte de verdade é sempre a API.
    }, []);

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        // TOPO DA PÁGINA: título e botão "+ Nova Campanha" (só visual)
        e('div', { className: "flex items-center justify-between" },
            e('h2', { className: "text-2xl font-bold text-slate-800" }, "Campanhas de Inovação"),
            e(Button, { variant: "primary" }, "+ Nova Campanha" /* apenass visual, sem ação aqui */)
        ),

        // LISTAGEM: Grid flexível mostrando cada campanha em um card
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            campaigns.map(c =>
                e(Card, {
                    key: c.id,
                    className: "group hover:border-blue-300 transition-colors"
                },
                    // Linha de topo do card: badge de status e data limite
                    e('div', { className: "flex justify-between items-start mb-4" },
                        e(Badge, { variant: c.status === 'ATIVA' ? 'success' : 'default' }, c.status),
                        e('span', { className: "text-xs text-slate-400" }, `Até ${c.deadline || 'Indefinido'}`)
                    ),
                    // Título da campanha
                    e('h3', { className: "text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors" }, c.title),
                    // Descrição resumida
                    e('p', { className: "text-slate-600 mb-6" }, c.description),
                    // Rodapé do card: avatares (fakes) e botão "Ver Ideias" (não funcional)
                    e('div', { className: "flex items-center justify-between pt-4 border-t border-slate-100" },
                        // Espaço reservado para avatares de participantes (ainda não implementado)
                        e('div', { className: "flex -space-x-2" },
                            [1, 2, 3].map(i => e('div', {
                                key: i,
                                className: "w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500"
                            }, "?"))
                        ),
                        // Botão "Ver Ideias" para aquela campanha (só visual, sem ação por enquanto)
                        e(Button, { variant: "secondary", className: "text-sm" }, "Ver Ideias")
                    )
                )
            )
        )
    );
};
