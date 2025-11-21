/**
 * ==========================================================================
 * DashboardView – PAINEL PRINCIPAL EXTRAMENTE DOCUMENTADO
 * ==========================================================================
 *
 * O QUE É ESSE COMPONENTE?
 * ----------------------------------------------------------------------------
 * - Esse componente é o painel de visão geral (dashboard) da área de inovação.
 * - Ele exibe os indicadores (KPIs) mais relevantes e dois gráficos visuais que
 *   mostram como o fluxo de ideias está evoluindo no sistema.
 * - O público deste painel é qualquer pessoa que precise ter uma visão rápida
 *   e clara dos principais números e do andamento das iniciativas de inovação.
 *
 * COMO FUNCIONA O CICLO DE VIDA DO COMPONENTE?
 * ----------------------------------------------------------------------------
 * 1) Assim que aparece na tela, ele consulta a API para buscar os dados do dashboard.
 *    - Durante essa busca, exibe um ícone de loading animado centralizado.
 *    - Nunca deixa a interface vazia enquanto espera.
 *
 * 2) Quando os dados chegam, armazena tudo em `data`.
 *
 * 3) Toda vez que o `data` mudar (ou seja, toda vez que chegarem dados novos),
 *    ele destrói todos os gráficos antigos do Chart.js e cria novos gráficos,
 *    para evitar vazamento de memória e garantir que os gráficos estão 100% corretos.
 *
 * 4) Os KPIs aparecem em três cards destacados:
 *    - Total de Ideias postadas
 *    - Total de votos recebidos pelas ideias
 *    - Taxa de aprovação das ideias (%)
 *
 * 5) Logo abaixo, aparecem dois gráficos:
 *    - Um gráfico Doughnut/“rosquinha” mostrando a distribuição das ideias por status
 *    - Um gráfico de Linha exibindo a evolução do número de ideias ao longo do tempo
 *
 * CUIDADOS E BOAS PRÁTICAS IMPORTANTES:
 * ----------------------------------------------------------------------------
 * - Não adicione aqui lógica de criação, edição, deletar ou qualquer interação.
 *   Este componente é só EXIBIÇÃO e RESUMO!
 * - Os gráficos são montados/desmontados via id dos canvases. Não mude esses ids!
 * - Se algum dia trocar os dados ou precisar atualizar esses indicadores, cuide para
 *   manter a clareza e o foco. Esse painel serve para visão geral, não para detalhes.
 * - Se quiser mudar layout, use classes utilitárias, mas SEM esconder os números!
 * - Use esse arquivo como exemplo de documentação para outras áreas.
 */

import { api } from '../services/api.js';
import { Card } from './ui/index.js';
const e = React.createElement;

export const DashboardView = () => {
    /**
     * Guarda os dados do dashboard vindos da API.
     * - Inicialmente, é null (enquanto está carregando).
     * - Quando os dados chegam, vira um objeto que contém:
     *     - data.kpis: indicadores principais (total_ideas, total_votes, approval_rate)
     *     - data.charts.by_status: array de objetos { status, count } para montar o gráfico
     *     - data.charts.evolution: array de objetos { date, count } para a evolução.
     */
    const [data, setData] = React.useState(null);

    /**
     * useEffect para buscar os dados logo na montagem.
     * - Chama api.getDashboard() apenas uma vez ao montar o componente.
     * - Assim que os dados chegam e "ok" for true, armazena tudo em `data`.
     */
    React.useEffect(() => {
        (async () => {
            const r = await api.getDashboard();
            if (r.ok) setData(r);
        })();
    }, []);

    /**
     * useEffect para controlar a criação e destruição dos gráficos do Chart.js
     * - Sempre que `data` mudar e não for null:
     *     - Destrói os gráficos antigos (se existirem) para evitar leaks de memória.
     *     - Cria os dois gráficos: Doughnut (status do pipeline) e Linha (evolução de ideias).
     * - Se trocar de dashboard, os canvases permanecem (relacionados pelo id).
     * - Chart do pipeline: mostra quantas ideias estão em cada status (ex: nova, em análise, etc).
     * - Chart de evolução: mostra quantas ideias foram criadas a cada dia/mês.
     */
    React.useEffect(() => {
        if (!data) return;

        // Remove gráficos antigos, se presentes.
        const chartStatus = Chart.getChart("chart-status");
        if (chartStatus) chartStatus.destroy();

        const chartEvol = Chart.getChart("chart-evol");
        if (chartEvol) chartEvol.destroy();

        // Monta o gráfico Doughnut (pipeline de status das ideias)
        const ctx1 = document.getElementById('chart-status');
        if (ctx1) new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: data.charts.by_status.map(x => x.status.replace('_', ' ')),
                datasets: [{
                    data: data.charts.by_status.map(x => x.count),
                    backgroundColor: [
                        // Cores: azul, amarelo, roxo, verde, vermelho.
                        '#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { usePointStyle: true, font: { family: 'Inter' } }
                    }
                },
                cutout: '70%'
            }
        });

        // Monta o gráfico de Linha (evolução temporal das ideias)
        const ctx2 = document.getElementById('chart-evol');
        if (ctx2) new Chart(ctx2, {
            type: 'line',
            data: {
                labels: data.charts.evolution.map(x => x.date),
                datasets: [{
                    label: 'Novas Ideias',
                    data: data.charts.evolution.map(x => x.count),
                    borderColor: '#0ea5e9',
                    backgroundColor: 'rgba(14, 165, 233, 0.1)',
                    fill: true,
                    tension: 0.4,         // Curvatura da linha
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },  // grid da vertical clara
                    x: { grid: { display: false } } // grid do eixo x escondida para ficar limpo
                }
            }
        });
    }, [data]);

    /**
     * ENQUANTO CARREGA:
     * - Exibe uma animação de loading centralizada.
     * - O usuário sempre tem feedback visual que o dashboard está trazendo dados!
     */
    if (!data) return e('div', { className: "flex items-center justify-center h-64" },
        e('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" })
    );

    /**
     * RENDERIZAÇÃO PRINCIPAL:
     * - Layout em Colunas (Cards com KPIs) no topo, depois os gráficos embaixo.
     * - Headline (Visão Geral) e horário da atualização.
     * - KPIs em três cards lado a lado (responsivos).
     * - Dois gráficos: pipeline (status) à esquerda, evolução à direita.
     * - Usa utilitários de Tailwind para espaçamento e responsividade.
     */
    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        // HEADER DO PAINEL (título + data fictícia da atualização)
        e('div', { className: "flex items-center justify-between" },
            e('h2', { className: "text-2xl font-bold text-slate-800" }, "Visão Geral"),
            e('div', { className: "text-sm text-slate-500" }, "Última atualização: Agora")
        ),

        // KPIs EM DESTAQUE (ideias, votos, aprovação)
        e('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            // Total de Ideias
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "absolute top-0 right-0 p-4 opacity-10" },
                    // Ícone em SVG: lâmpada (ideia)
                    e('svg', { className: "w-16 h-16", fill: "currentColor", viewBox: "0 0 20 20" },
                        e('path', { d: "M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" })
                    )
                ),
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Total de Ideias"), // Legenda
                e('div', { className: "text-4xl font-bold text-slate-800" }, data.kpis.total_ideas),    // Valor principal
                e('div', { className: "mt-2 text-xs text-emerald-600 font-medium flex items-center" }, "▲ 12% vs mês anterior")
                // PS: o dado comparativo pode ser adaptado conforme novo requisito.
            ),
            // Total de Votos
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Votos Computados"),
                e('div', { className: "text-4xl font-bold text-slate-800" }, data.kpis.total_votes),
                e('div', { className: "mt-2 text-xs text-blue-600 font-medium" }, "Engajamento alto")
            ),
            // Taxa de Aprovação
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Taxa de Aprovação"),
                e('div', { className: "text-4xl font-bold text-emerald-600" }, `${data.kpis.approval_rate}%`),
                e('div', { className: "mt-2 text-xs text-slate-400" }, "Ideias implementadas")
            )
        ),

        // GRÁFICOS – Pipeline por status e evolução
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            // Gráfico Doughnut (status do pipeline)
            e(Card, null,
                e('h3', { className: "text-lg font-semibold text-slate-800 mb-6" }, "Status do Pipeline"),
                e('div', { className: "h-64 flex items-center justify-center" },
                    e('canvas', { id: 'chart-status' })
                )
            ),
            // Gráfico de linha (evolução ao longo do tempo)
            e(Card, null,
                e('h3', { className: "text-lg font-semibold text-slate-800 mb-6" }, "Evolução de Ideias"),
                e('div', { className: "h-64" },
                    e('canvas', { id: 'chart-evol' })
                )
            )
        )
    );
};
