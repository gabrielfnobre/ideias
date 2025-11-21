/**
 * ==================================================================================
 * CreateIdeaModal — Modal para Cadastro de Nova Ideia, 100% DOCUMENTADO PARA TODOS
 * ==================================================================================
 *
 * PROPÓSITO DO COMPONENTE:
 * ------------------------------------------------------------------------------
 * Este componente exibe um modal (janela sobreposta) para permitir ao usuário 
 * cadastrar UMA NOVA IDEIA na plataforma.
 * 
 * 🚫 Ele NÃO serve para editar, visualizar, votar ou listar ideias já existentes!
 * É SÓ para criar uma ideia nova.
 *
 * COMO USAR? — PROPRIEDADES (props) OBRIGATÓRIAS:
 * ------------------------------------------------------------------------------
 * - isOpen (boolean):      Se true, o modal aparece na tela. Se false, fica escondido.
 * - onClose (function):    Função chamada para fechar o modal. (Use sempre para não travar a interface!)
 * - onSuccess (function):  Função executada automaticamente quando a ideia é criada com sucesso.
 *
 * FLUXO VISUAL E FUNCIONAL RESUMIDO:
 * ------------------------------------------------------------------------------
 * 1. O modal aparece sempre que isOpen for true.
 * 2. O modal traz duas perguntas principais:
 *      a) Título da ideia (campo de texto único)
 *      b) Descrição detalhada (campo de textarea para detalhar o máximo possível)
 * 3. O usuário só pode enviar se ambos os campos estiverem preenchidos de verdade.
 * 4. Ao clicar em “Criar Ideia”, a função handleSubmit:
 *      - Valida que nada está vazio.
 *      - Mostra loading durante o envio.
 *      - Chama a API para cadastrar (api.createIdea).
 *      - Se OK: limpa campos, fecha o modal e dispara onSuccess().
 *      - Se erro: mostra mensagem de alerta direto para o usuário (poderia ser melhor, mas aqui é explícito!).
 * 5. Os botões “Cancelar” e “Criar Ideia” sempre aparecem prontos para uso.
 *
 * DICAS IMPORTANTES PARA QUEM FOR MEXER:
 * ------------------------------------------------------------------------------
 * - Sempre passe onClose e onSuccess corretamente, para evitar modais “presos”.
 * - Se quiser melhorar a experiência de erro, troque o alert() por algo no modal.
 * - Pode incrementar com outros campos depois, detalhando sempre esse JSDoc.
 *
 * EXEMPLO DE USO:
 * ------------------------------------------------------------------------------
 * <CreateIdeaModal
 *   isOpen={mostrarNovaIdeia}
 *   onClose={() => setMostrarNovaIdeia(false)}
 *   onSuccess={() => atualizarListaIdeias()}
 * />
 */

import { Modal, Input, Button } from './ui/index.js';
import { api } from '../services/api.js';
const e = React.createElement;

export const CreateIdeaModal = ({ isOpen, onClose, onSuccess }) => {
    /**
     * title: armazena o texto digitado para o título da ideia.
     * description: texto completo da descrição da ideia.
     * loading: true ENQUANTO a API está processando o envio da ideia.
     */
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    // DICA: Esses estados são zerados só ao criar ideia. Se quiser resetar ao abrir, limpe-os com useEffect ao abrir o modal.

    /**
     * handleSubmit:
     * ----------------------------------------------------------------------------
     * Função que valida campos, dispara o envio para a API e controla loading.
     * - Não deixa enviar se qualquer campo estiver vazio (trim elimina espaços).
     * - Se envio tiver sucesso:
     *      • Limpa campos.
     *      • Dispara o callback onSuccess() (útil para atualizar listas, etc).
     *      • Fecha o modal imediatamente.
     * - Se erro:
     *      • Mostra alerta simples explicando o que houve.
     * - Desativa duplo envio enquanto loading = true.
     */
    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return; // Bloqueia envio incompleto

        setLoading(true);
        const res = await api.createIdea({ title, description });
        setLoading(false);

        if (res.ok) {
            setTitle('');
            setDescription('');
            onSuccess();
            onClose();
        } else {
            // Mostra o erro recebido da API ou uma mensagem padrão
            alert('Erro ao criar ideia: ' + (res.error || 'Erro desconhecido'));
        }
    };

    /**
     * Renderização do modal passo-a-passo:
     * ----------------------------------------------------------------------------
     * - Modal: recebe isOpen, onClose e título.
     * - Texto de orientação para ajudar qualquer usuário a entender o que fazer.
     * - Campo de Título (Input): valor controlado por estado.
     * - Campo de Descrição (textarea): grande, estilizado, valor controlado.
     * - Botões no rodapé: “Cancelar” (fecha), “Criar Ideia” (envia e desabilita se loading).
     */
    return e(Modal, {
        isOpen: isOpen,
        onClose: onClose,
        title: "Nova Ideia 💡"
    },
        e('div', { className: "space-y-6" },
            // Mensagem clara estimulando colaboração e explicação detalhada
            e('div', { className: "bg-blue-50 p-4 rounded-lg text-sm text-blue-800" },
                "Compartilhe sua visão! Descreva sua ideia de forma clara para que outros possam entender e votar."
            ),

            // Campo para Título da Ideia
            e(Input, {
                label: "Título da Ideia",
                placeholder: "Ex: Otimização do processo de...",
                value: title,
                onChange: e => setTitle(e.target.value)
            }),

            // Campo para Descrição Detalhada da Ideia
            e('div', { className: "space-y-1" },
                e('label', { className: "block text-sm font-medium text-slate-700" }, "Descrição Detalhada"),
                e('textarea', {
                    className: "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all min-h-[150px] resize-none",
                    placeholder: "Explique como sua ideia vai ajudar...",
                    value: description,
                    onChange: e => setDescription(e.target.value)
                })
            ),

            // Botões de ação (rodapé): Cancelar e Criar Ideia
            e('div', { className: "flex justify-end gap-3 pt-2" },
                e(Button, { variant: "ghost", onClick: onClose }, "Cancelar"),
                e(Button, { onClick: handleSubmit, disabled: loading },
                    loading ? "Enviando..." : "Criar Ideia"
                )
            )
        )
    );
};
