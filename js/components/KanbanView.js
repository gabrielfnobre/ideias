import { api } from '../services/api.js';
import { IdeaCard } from './IdeaCard.js';
import { IdeaDetailView } from './IdeaDetailView.js';
import { Modal, Input, Button } from './ui/index.js';
const e = React.createElement;

export const KanbanView = ({ onOpenAuth }) => {
    const [ideas, setIdeas] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [selectedIdea, setSelectedIdea] = React.useState(null);
    const [draggedIdea, setDraggedIdea] = React.useState(null);

    const load = async () => {
        const r = await api.getIdeas();
        if (r.ok) setIdeas(r.ideas);
    };

    React.useEffect(() => { load(); }, []);

    const handleDragStart = (ev, idea) => {
        setDraggedIdea(idea);
        ev.dataTransfer.effectAllowed = 'move';
        // Ghost image customization could go here
    };

    const handleDragOver = (ev) => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (ev, newStatus) => {
        ev.preventDefault();
        if (!draggedIdea || draggedIdea.status === newStatus) return;

        // Optimistic Update
        const oldStatus = draggedIdea.status;
        setIdeas(prev => prev.map(i => i.id === draggedIdea.id ? { ...i, status: newStatus } : i));

        try {
            await api.updateStatus(draggedIdea.id, newStatus);
        } catch (error) {
            // Revert on error
            setIdeas(prev => prev.map(i => i.id === draggedIdea.id ? { ...i, status: oldStatus } : i));
            alert('Erro ao mover ideia.');
        }
        setDraggedIdea(null);
    };

    const columns = [
        { id: 'EM_ELABORACAO', label: 'Em Elaboração', color: 'bg-slate-50 border-slate-200' },
        { id: 'EM_TRIAGEM', label: 'Triagem', color: 'bg-blue-50/50 border-blue-100' },
        { id: 'EM_AVALIACAO', label: 'Em Avaliação', color: 'bg-amber-50/50 border-amber-100' },
        { id: 'APROVADA', label: 'Aprovada', color: 'bg-emerald-50/50 border-emerald-100' }
    ];

    return e('div', { className: "h-[calc(100vh-140px)] overflow-y-auto md:overflow-x-auto pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500" },
        // Kanban Board
        e('div', { className: "flex flex-col md:flex-row gap-6 h-full min-w-full md:min-w-[1200px]" },
            columns.map(col =>
                e('div', {
                    key: col.id,
                    className: `flex-1 flex flex-col ${col.color} border rounded-2xl p-4 transition-colors min-h-[500px] md:min-h-0 ${draggedIdea ? 'ring-2 ring-blue-500/20 border-blue-300 border-dashed' : ''}`,
                    onDragOver: handleDragOver,
                    onDrop: (ev) => handleDrop(ev, col.id)
                },
                    e('div', { className: "flex items-center justify-between mb-4 px-1" },
                        e('h3', { className: "font-bold text-slate-700" }, col.label),
                        e('span', { className: "bg-white px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-500 shadow-sm" },
                            ideas.filter(i => i.status === col.id).length
                        )
                    ),
                    e('div', { className: "flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar" },
                        ideas.filter(i => i.status === col.id).map(i =>
                            e('div', {
                                key: i.id,
                                draggable: true,
                                onDragStart: (ev) => handleDragStart(ev, i),
                                className: "cursor-grab active:cursor-grabbing transform transition-transform hover:-translate-y-1"
                            },
                                e(IdeaCard, {
                                    idea: i,
                                    onClick: () => setSelectedIdea(i),
                                    onVote: (ev) => { ev.stopPropagation(); /* Vote logic handled inside modal or card */ },
                                    showActions: false // Hide actions in card, show in modal
                                })
                            )
                        )
                    )
                )
            )
        ),

        // Detail Modal (Trello-like)
        selectedIdea && e(Modal, {
            isOpen: !!selectedIdea,
            onClose: () => { setSelectedIdea(null); load(); }, // Reload on close to get updates
            title: null // Custom header in IdeaDetailView
        },
            e('div', { className: "max-h-[80vh] overflow-y-auto custom-scrollbar -m-6 p-6" },
                e(IdeaDetailView, {
                    idea: selectedIdea,
                    onOpenAuth,
                    isModal: true,
                    onBack: () => setSelectedIdea(null)
                })
            )
        )
    );
};
