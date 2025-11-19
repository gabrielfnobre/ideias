import { api } from '../services/api.js';
import { Card, Badge, Button } from './ui/index.js';
const e = React.createElement;

export const CampaignsView = ({ campaigns: initialCampaigns }) => {
    const [campaigns, setCampaigns] = React.useState(initialCampaigns || []);

    React.useEffect(() => {
        (async () => {
            const r = await api.getCampaigns();
            if (r.ok) setCampaigns(r.campaigns);
        })();
    }, []);

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        e('div', { className: "flex items-center justify-between" },
            e('h2', { className: "text-2xl font-bold text-slate-800" }, "Campanhas de Inovação"),
            e(Button, { variant: "primary" }, "+ Nova Campanha")
        ),

        e('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            campaigns.map(c =>
                e(Card, { key: c.id, className: "group hover:border-blue-300 transition-colors" },
                    e('div', { className: "flex justify-between items-start mb-4" },
                        e(Badge, { variant: c.status === 'ATIVA' ? 'success' : 'default' }, c.status),
                        e('span', { className: "text-xs text-slate-400" }, `Até ${c.deadline || 'Indefinido'}`)
                    ),
                    e('h3', { className: "text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors" }, c.title),
                    e('p', { className: "text-slate-600 mb-6" }, c.description),
                    e('div', { className: "flex items-center justify-between pt-4 border-t border-slate-100" },
                        e('div', { className: "flex -space-x-2" },
                            [1, 2, 3].map(i => e('div', { key: i, className: "w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500" }, "?"))
                        ),
                        e(Button, { variant: "secondary", className: "text-sm" }, "Ver Ideias")
                    )
                )
            )
        )
    );
};
