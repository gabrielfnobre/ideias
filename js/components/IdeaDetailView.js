import { api } from '../services/api.js';
import { Card, Badge, Button } from './ui/index.js';
const e = React.createElement;

export const IdeaDetailView = ({ idea: initialIdea, onBack, onOpenAuth, isModal = false }) => {
    const [idea, setIdea] = React.useState(initialIdea);
    const [commentText, setCommentText] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleVote = async () => {
        const r = await api.vote(idea.id);
        if (r.ok) {
            setIdea(prev => ({ ...prev, votes: r.votes }));
        } else if (r.error === 'nao_autenticado') {
            onOpenAuth();
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) return;
        setLoading(true);
        const r = await api.comment(idea.id, commentText);
        if (r.ok) {
            setIdea(r.idea);
            setCommentText('');
        }
        setLoading(false);
    };

    return e('div', { className: `max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300 ${isModal ? '' : 'py-8'}` },
        // Header Actions (Only show if not in modal)
        !isModal && e('div', { className: "flex items-center gap-4" },
            e(Button, { variant: "ghost", onClick: onBack }, "← Voltar"),
            e('div', { className: "flex-1" })
        ),

        // Main Content
        e(Card, { className: "p-8" },
            e('div', { className: "flex items-start justify-between mb-6" },
                e('div', { className: "space-y-2" },
                    e('div', { className: "flex items-center gap-3" },
                        e(Badge, { variant: "info" }, idea.status.replace('_', ' ')),
                        e('span', { className: "text-sm text-slate-500" }, `Campanha: ${idea.campaign || 'Geral'}`)
                    ),
                    e('h1', { className: "text-3xl font-bold text-slate-900" }, idea.title)
                ),
                e('div', { className: "text-center bg-blue-50 p-4 rounded-xl" },
                    e('div', { className: "text-3xl font-bold text-blue-600" }, idea.votes || 0),
                    e('div', { className: "text-xs font-medium text-blue-400 uppercase" }, "Votos")
                )
            ),

            e('div', { className: "prose prose-slate max-w-none mb-8" },
                e('p', { className: "text-lg text-slate-600 leading-relaxed" }, idea.description)
            ),

            e('div', { className: "flex items-center gap-4 pt-6 border-t border-slate-100" },
                e(Button, { onClick: handleVote, className: "gap-2" },
                    e('span', null, "▲"), "Votar nesta Ideia"
                ),
                e('div', { className: "flex items-center gap-2 ml-auto" },
                    e('div', { className: "text-right" },
                        e('div', { className: "text-sm font-bold text-slate-900" }, idea.author_name),
                        e('div', { className: "text-xs text-slate-500" }, new Date(idea.created_at).toLocaleDateString())
                    ),
                    e('div', { className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold" },
                        idea.author_name ? idea.author_name.charAt(0) : '?'
                    )
                )
            )
        ),

        // AI Analysis (Mock)
        e(Card, { className: "bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none" },
            e('div', { className: "flex items-center gap-3 mb-4" },
                e('span', { className: "text-2xl" }, "🤖"),
                e('h3', { className: "text-lg font-bold" }, "Análise da IA - em construção")
            ),
            e('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Compatibilidade"),
                    e('div', { className: "text-2xl font-bold text-emerald-400" }, `${idea.compat_ai || 0}%`),
                    e('div', { className: "text-xs text-slate-500" }, "Alinhamento estratégico")
                ),
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Impacto Estimado"),
                    e('div', { className: "text-2xl font-bold text-blue-400" }, "Alto"),
                    e('div', { className: "text-xs text-slate-500" }, "Baseado em similares")
                ),
                e('div', null,
                    e('div', { className: "text-slate-400 text-sm mb-1" }, "Complexidade"),
                    e('div', { className: "text-2xl font-bold text-amber-400" }, "Média"),
                    e('div', { className: "text-xs text-slate-500" }, "Tempo de implementação")
                )
            )
        ),

        // Comments
        e('div', { className: "space-y-4" },
            e('h3', { className: "text-xl font-bold text-slate-800" }, "Comentários"),

            e(Card, { className: "p-4" },
                e('div', { className: "flex gap-3" },
                    e('textarea', {
                        className: "flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none",
                        placeholder: "Adicione um comentário...",
                        rows: 2,
                        value: commentText,
                        onChange: e => setCommentText(e.target.value)
                    }),
                    e(Button, { onClick: handleComment, disabled: loading || !commentText.trim() }, "Enviar")
                )
            ),

            (idea.comments || []).map(c =>
                e(Card, { key: c.id, className: "p-4" },
                    e('div', { className: "flex justify-between items-start mb-2" },
                        e('div', { className: "font-bold text-slate-700" }, "Usuário"), // Backend doesn't send commenter name yet
                        e('div', { className: "text-xs text-slate-400" }, new Date(c.created_at).toLocaleString())
                    ),
                    e('p', { className: "text-slate-600" }, c.text)
                )
            )
        )
    );
};
