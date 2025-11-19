import { Modal, Input, Button } from './ui/index.js';
import { api } from '../services/api.js';
const e = React.createElement;

export const CreateIdeaModal = ({ isOpen, onClose, onSuccess }) => {
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;

        setLoading(true);
        const res = await api.createIdea({ title, description });
        setLoading(false);

        if (res.ok) {
            setTitle('');
            setDescription('');
            onSuccess();
            onClose();
        } else {
            alert('Erro ao criar ideia: ' + (res.error || 'Erro desconhecido'));
        }
    };

    return e(Modal, {
        isOpen: isOpen,
        onClose: onClose,
        title: "Nova Ideia 💡"
    },
        e('div', { className: "space-y-6" },
            e('div', { className: "bg-blue-50 p-4 rounded-lg text-sm text-blue-800" },
                "Compartilhe sua visão! Descreva sua ideia de forma clara para que outros possam entender e votar."
            ),

            e(Input, {
                label: "Título da Ideia",
                placeholder: "Ex: Otimização do processo de...",
                value: title,
                onChange: e => setTitle(e.target.value)
            }),

            e('div', { className: "space-y-1" },
                e('label', { className: "block text-sm font-medium text-slate-700" }, "Descrição Detalhada"),
                e('textarea', {
                    className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[150px] resize-none",
                    placeholder: "Explique como sua ideia vai ajudar...",
                    value: description,
                    onChange: e => setDescription(e.target.value)
                })
            ),

            e('div', { className: "flex justify-end gap-3 pt-2" },
                e(Button, { variant: "ghost", onClick: onClose }, "Cancelar"),
                e(Button, { onClick: handleSubmit, disabled: loading },
                    loading ? "Enviando..." : "Criar Ideia"
                )
            )
        )
    );
};
