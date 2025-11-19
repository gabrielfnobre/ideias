import { api } from '../services/api.js';
import { Card } from './ui/index.js';
const e = React.createElement;

export const DashboardView = () => {
    const [data, setData] = React.useState(null);

    React.useEffect(() => {
        (async () => {
            const r = await api.getDashboard();
            if (r.ok) setData(r);
        })();
    }, []);

    React.useEffect(() => {
        if (!data) return;

        // Destroy existing charts if any (simple check)
        const chartStatus = Chart.getChart("chart-status");
        if (chartStatus) chartStatus.destroy();
        const chartEvol = Chart.getChart("chart-evol");
        if (chartEvol) chartEvol.destroy();

        const ctx1 = document.getElementById('chart-status');
        if (ctx1) new Chart(ctx1, {
            type: 'doughnut',
            data: {
                labels: data.charts.by_status.map(x => x.status.replace('_', ' ')),
                datasets: [{
                    data: data.charts.by_status.map(x => x.count),
                    backgroundColor: ['#0ea5e9', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Inter' } } } },
                cutout: '70%'
            }
        });

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
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }, [data]);

    if (!data) return e('div', { className: "flex items-center justify-center h-64" },
        e('div', { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" })
    );

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        e('div', { className: "flex items-center justify-between" },
            e('h2', { className: "text-2xl font-bold text-slate-800" }, "Visão Geral"),
            e('div', { className: "text-sm text-slate-500" }, "Última atualização: Agora")
        ),

        // KPIs
        e('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "absolute top-0 right-0 p-4 opacity-10" },
                    e('svg', { className: "w-16 h-16", fill: "currentColor", viewBox: "0 0 20 20" }, e('path', { d: "M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" }))
                ),
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Total de Ideias"),
                e('div', { className: "text-4xl font-bold text-slate-800" }, data.kpis.total_ideas),
                e('div', { className: "mt-2 text-xs text-emerald-600 font-medium flex items-center" }, "▲ 12% vs mês anterior")
            ),
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Votos Computados"),
                e('div', { className: "text-4xl font-bold text-slate-800" }, data.kpis.total_votes),
                e('div', { className: "mt-2 text-xs text-blue-600 font-medium" }, "Engajamento alto")
            ),
            e(Card, { className: "relative overflow-hidden" },
                e('div', { className: "text-sm font-medium text-slate-500 mb-1" }, "Taxa de Aprovação"),
                e('div', { className: "text-4xl font-bold text-emerald-600" }, `${data.kpis.approval_rate}%`),
                e('div', { className: "mt-2 text-xs text-slate-400" }, "Ideias implementadas")
            )
        ),

        // Charts
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            e(Card, null,
                e('h3', { className: "text-lg font-semibold text-slate-800 mb-6" }, "Status do Pipeline"),
                e('div', { className: "h-64 flex items-center justify-center" },
                    e('canvas', { id: 'chart-status' })
                )
            ),
            e(Card, null,
                e('h3', { className: "text-lg font-semibold text-slate-800 mb-6" }, "Evolução de Ideias"),
                e('div', { className: "h-64" },
                    e('canvas', { id: 'chart-evol' })
                )
            )
        )
    );
};
