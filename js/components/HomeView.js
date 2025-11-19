import { api } from '../services/api.js';
import { IdeaCard } from './IdeaCard.js';
import { Button, Input } from './ui/index.js';
const e = React.createElement;

export const HomeView = ({ onOpenIdea, onOpenAuth }) => {
    const [ideas, setIdeas] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState('');

    React.useEffect(() => {
        (async () => {
            const r = await api.getIdeas();
            if (r.ok) setIdeas(r.ideas);
            setLoading(false);
        })();
    }, []);

    const handleVote = async (idea) => {
        const r = await api.vote(idea.id);
        if (r.ok) {
            setIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, votes: r.votes } : p));
        } else if (r.error === 'nao_autenticado') {
            onOpenAuth();
        } else {
            alert('Erro ao votar: ' + r.error);
        }
    };

    const filteredIdeas = ideas.filter(i =>
        i.title.toLowerCase().includes(filter.toLowerCase()) ||
        i.description.toLowerCase().includes(filter.toLowerCase())
    );

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        // Hero / Search
        e('div', { className: "bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 text-center space-y-6" },
            e('h1', { className: "text-4xl font-bold text-slate-900 tracking-tight" },
                "Transforme suas ideias em ",
                e('span', { className: "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500" }, "Inovação")
            ),
            e('p', { className: "text-lg text-slate-600 max-w-2xl mx-auto" }, "Compartilhe visões, colabore com colegas e ajude a construir o futuro da PROENG."),

            e('div', { className: "max-w-xl mx-auto relative" },
                e('input', {
                    type: "text",
                    placeholder: "Pesquisar ideias...",
                    className: "w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-lg transition-all shadow-inner",
                    value: filter,
                    onChange: e => setFilter(e.target.value)
                }),
                e('span', { className: "absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-slate-400" }, "🔍")
            )
        ),

        // Ideas Grid
        e('div', { className: "space-y-4" },
            e('div', { className: "flex items-center justify-between" },
                e('h2', { className: "text-xl font-bold text-slate-800" }, "Ideias Recentes"),
                e('div', { className: "flex gap-2" },
                    e(Button, { variant: "ghost", className: "text-sm" }, "Mais Recentes"),
                    e(Button, { variant: "ghost", className: "text-sm" }, "Mais Votadas")
                )
            ),

            loading
                ? e('div', { className: "text-center py-12 text-slate-400" }, "Carregando ideias...")
                : e('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
                    filteredIdeas.map(idea =>
                        e(IdeaCard, {
                            key: idea.id,
                            idea,
                            onClick: onOpenIdea,
                            onVote: (ev) => {
                                ev.stopPropagation();
                                handleVote(idea);
                            }
                        })
                    )
                )
        )
    );
};
