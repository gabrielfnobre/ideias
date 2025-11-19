import { Card, Badge, Button } from './ui/index.js';
const e = React.createElement;

export const IdeaCard = ({ idea, onVote, onClick, onEdit, showActions = true }) => {
    const statusColors = {
        'EM_ELABORACAO': 'default',
        'EM_TRIAGEM': 'info',
        'EM_AVALIACAO': 'warning',
        'APROVADA': 'success',
        'REJEITADA': 'danger'
    };

    return e(Card, { className: "group hover:shadow-blue-500/10 transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500 cursor-pointer relative", onClick: () => onClick(idea) },
        e('div', { className: "flex justify-between items-start mb-3" },
            e(Badge, { variant: statusColors[idea.status] || 'default' }, idea.status.replace('_', ' ')),
            e('span', { className: "text-xs font-mono text-slate-400" }, `#${idea.id}`)
        ),

        e('h3', { className: "text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2" }, idea.title),
        e('p', { className: "text-slate-600 text-sm mb-4 line-clamp-3" }, idea.description),

        e('div', { className: "flex items-center justify-between mt-auto pt-4 border-t border-slate-100" },
            e('div', { className: "flex items-center gap-2" },
                e('div', { className: "w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] text-white font-bold" },
                    idea.author_name ? idea.author_name.charAt(0) : '?'
                ),
                e('span', { className: "text-xs text-slate-500 truncate max-w-[100px]" }, idea.author_name)
            ),

            showActions && e('div', { className: "flex items-center gap-2", onClick: (ev) => ev.stopPropagation() },
                // Edit Button (only visible if onEdit is provided)
                onEdit && e('button', {
                    onClick: () => onEdit(idea),
                    className: "p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors",
                    title: "Editar Ideia"
                }, "✎"),

                e('button', {
                    onClick: onVote,
                    className: "flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                },
                    e('span', null, "▲"),
                    e('span', { className: "text-xs font-bold" }, idea.votes || 0)
                )
            )
        )
    );
};
