/**
 * ========================================================================
 * COMPONENTES DE UI — LEITURA FÁCIL E DOCUMENTAÇÃO EXPLICATIVA PARA TODOS
 * ========================================================================
 *
 * Esta coleção traz componentes React reutilizáveis prontos para criar
 * interfaces modernas e agradáveis. Cada componente abaixo tem uma documentação
 * clara para facilitar o uso até para quem está começando.
 * 
 * Todos usam React.createElement (`e`) para máxima flexibilidade.
 */

const e = React.createElement;

/**
 * ==================
 * <Button />
 * ==================
 * 
 * Botão estilizado, pronto para diferentes contextos de ação.
 * 
 * PARA QUE SERVE?
 * 
 * - Usado para ações (salvar, enviar, deletar, etc).
 * - Variantes de estilo para deixar visual claro do que é importante, secundário ou perigoso.
 * 
 * COMO USAR:
 * 
 * <Button onClick={ação}>Clique aqui</Button>
 * <Button variant="danger" disabled>Excluir</Button>
 * 
 * PROPRIEDADES (props):
 * --------------------------------------------------------------------------
 * - children   (obrigatório): O que vai dentro do botão (texto, ícone, etc).
 * - onClick    (obrigatório): Função chamada quando clicar.
 * - variant    (opcional):   Visual do botão.
 *                            Opções: 'primary' (azul), 'secondary' (borda), 
 *                                     'ghost' (só texto leve), 'danger' (vermelho).
 *                            Padrão: 'primary'
 * - className  (opcional):   Adiciona suas próprias classes CSS.
 * - disabled   (opcional):   Deixa o botão inativo (não pode clicar).
 * - ...props   (opcional):   Qualquer outra prop válida para <button>.
 * 
 * DICA DE USO:
 *   - Usar 'primary' para ação principal.
 *   - 'secondary' para alternativas.
 *   - 'ghost' só para links ou botões discretos.
 *   - 'danger' para exclusões/ações arriscadas.
 */
export const Button = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false,
    ...props
}) => {
    // Classe base: estiliza o botão de modo consistente no layout
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    // Estilos para cada tipo de botão
    const variants = {
        primary:
            "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02]",
        secondary:
            "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300",
        ghost:
            "text-slate-600 hover:bg-slate-100",
        danger:
            "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
    };

    return e(
        'button',
        {
            className: `${baseClass} ${variants[variant]} ${className}`,
            onClick,
            disabled,
            ...props
        },
        children
    );
};

/**
 * ==================
 * <Card />
 * ==================
 * 
 * Caixa visual para agrupar e destacar conteúdo na página.
 * 
 * PARA QUE SERVE?
 * 
 * - Separar seções (ex.: formulário, bloco de info, lista).
 * - Dar foco visual a alguma parte do layout com leveza.
 * 
 * COMO USAR:
 * 
 * <Card>
 *   <h3>Título</h3>
 *   <p>Seus dados aqui.</p>
 * </Card>
 * 
 * PROPRIEDADES (props):
 * --------------------------------------------------------------------------
 * - children   (obrigatório): Conteúdo que irá dentro do card.
 * - className  (opcional):   Personalize ainda mais o visual (CSS extra).
 * - ...props   (opcional):   Qualquer outro atributo aceito por <div>.
 * 
 * DICA DE USO:
 *   Use cards para separar e organizar visualmente trechos da interface.
 */
export const Card = ({ children, className = '', ...props }) => {
    return e(
        'div',
        {
            className: `bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-2xl p-6 ${className}`,
            ...props
        },
        children
    );
};


/**
 * ==================
 * <Input />
 * ==================
 * 
 * Componente para campo de texto com estilo limpo e com campo para rótulo.
 * 
 * PARA QUE SERVE?
 * 
 * - Entradas de texto, emails, senhas, etc., de forma acessível e padronizada.
 * - Mostra rótulo acima do campo, facilita uso em formulários.
 * 
 * COMO USAR:
 * 
 * <Input label="Seu nome" id="input-nome" value={nome} onChange={setNome} />
 * 
 * PROPRIEDADES (props):
 * --------------------------------------------------------------------------
 * - label      (opcional):   Rótulo mostrado acima do input. Use para acessibilidade.
 * - id         (opcional*):  É obrigatório se usar label — liga o <label> ao <input>.
 * - className  (opcional):   CSS personalizado a mais.
 * - ...props   (opcional):   Qualquer prop válida pra <input> (type, value, onChange, etc).
 * 
 * DICA DE USO:
 *   Sempre use label, pois ajuda usuários (e leitores de tela) a saber para que serve o campo!
 *   Coloque um id único quando for usar label.
 */

// Função para formatar o valor em formato de CPF (XXX.XXX.XXX-XX)
function formatCPF(value) {
    // Remove tudo que não é número
    const v = value.replace(/\D/g, '').slice(0, 11);
    // Aplica a máscara
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.replace(/(\d{3})(\d+)/, '$1.$2');
    if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
}

// Função para validar um CPF (retorna true se CPF for válido)
function validateCPF(cpf) {
    cpf = (cpf || "").replace(/[^\d]+/g,'');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let sum = 0, rest;
    for (let i=1; i<=9; i++) sum += parseInt(cpf.substring(i-1,i)) * (11-i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(9,10))) return false;
    sum = 0;
    for (let i=1; i<=10; i++) sum += parseInt(cpf.substring(i-1,i)) * (12-i);
    rest = (sum * 10) % 11;
    if ((rest === 10) || (rest === 11)) rest = 0;
    if (rest !== parseInt(cpf.substring(10,11))) return false;
    return true;
}

export const Input = ({ label, id, className = '', type, value, onChange, ...props }) => {
    // Se for tipo cpf, vamos formatar e validar internamente
    const isCpf = type === 'cpf';
    // Estado local para input de cpf -- mas mantenha controlado de acordo com os props
    const [localValue, setLocalValue] = React.useState(value || '');

    // Sincroniza estado local e externo caso value mude ("componente controlado")
    React.useEffect(() => {
        if (isCpf && value !== localValue) {
            setLocalValue(formatCPF(value ?? ''));
        }
        // eslint-disable-next-line
    }, [value]);

    function handleInputChange(ev) {
        let val = ev.target.value;
        if (isCpf) {
            val = formatCPF(val);
            setLocalValue(val);
            // Remove a máscara para passar somente números pro callback, se desejar
            if (onChange) {
                // Notifica também se válido via e.target.isValid
                const fakeEvent = {
                    ...ev,
                    target: {
                        ...ev.target,
                        value: val,
                        // Informar para callback se cpf está válido
                        isValid: validateCPF(val)
                    }
                };
                onChange(fakeEvent);
            }
        } else if (onChange) {
            onChange(ev);
        }
    }

    const inputProps = {
        id,
        className: `w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${className}`,
        ...(isCpf
            ? {
                value: localValue,
                onChange: handleInputChange,
                maxLength: 14, // "XXX.XXX.XXX-XX"
                inputMode: 'numeric',
                autoComplete: "off",
                type: "text"
            }
            : {
                value,
                onChange,
                type
            }
        ),
        ...props
    };

    return e(
        'div',
        { className: "space-y-1" },
        label &&
            e(
                'label',
                { htmlFor: id, className: "block text-sm font-medium text-slate-700" },
                label
            ),
        e('input', inputProps)
    );
};

/**
 * ==================
 * <Badge />
 * ==================
 * 
 * Pequena faixa colorida para destacar uma palavra/ícone, usado
 * principalmente para informações rápidas: status, categoria, etc.
 * 
 * PARA QUE SERVE?
 * 
 * - Exibir status (ex.: "Ativo", "Novo", "Pendente").
 * - Marcar categorias ou níveis.
 * 
 * COMO USAR:
 * 
 * <Badge variant="success">Aprovado</Badge>
 * <Badge variant="warning">Pendente</Badge>
 * <Badge>Normal</Badge>
 * 
 * PROPRIEDADES (props):
 * --------------------------------------------------------------------------
 * - children   (obrigatório): Texto ou ícone a ser exibido.
 * - variant    (opcional):    Define cor e estilo do badge.
 *                            Opções: 'default', 'success', 'warning', 'info', 'purple'.
 *                            Padrão: 'default'
 *
 * DICA DE USO:
 *   Badge é para informação rápida! Não tente usar como botão nem para destacar demais.
 */
export const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: "bg-slate-100 text-slate-600",
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        info: "bg-blue-100 text-blue-700 border border-blue-200",
        purple: "bg-purple-100 text-purple-700 border border-purple-200"
    };
    return e(
        'span',
        {
            className: `px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`
        },
        children
    );
};

/**
 * ==================
 * <Modal />
 * ==================
 * 
 * Janela flutuante para chamar atenção do usuário: confirmações, formulários rápidos ou
 * alertas importantes.
 * 
 * COMO FUNCIONA?
 * 
 * - Aparece por cima de tudo, centralizado na tela.
 * - Fundo escurecido, bloqueia interação fora do modal.
 * - O modal é fechado ao clicar fora da caixa ou no “✕”.
 * 
 * COMO USAR:
 * 
 * <Modal
 *    isOpen={isModalOpen}
 *    onClose={() => setIsModalOpen(false)}
 *    title="Confirmação"
 * >
 *    Tem certeza que deseja sair?
 * </Modal>
 * 
 * PROPRIEDADES (props):
 * --------------------------------------------------------------------------
 * - isOpen     (obrigatório):   Se true, modal aparece; se false, não aparece.
 * - onClose    (obrigatório):   Função chamada quando usuário fecha (clica fora ou no “✕”).
 * - title      (obrigatório):   Título exibido no topo do modal.
 * - children   (obrigatório):   Conteúdo do corpo do modal (texto, formulário, etc.).
 *
 * DICA DE USO:
 *   Só use um modal por vez, para não confundir o usuário.
 */
export const Modal = ({ 
        isOpen, 
        onClose = () => {
            let modal = document.getElementById('modal_close');
            if (modal) {
                modal.parentNode && modal.parentNode.removeChild(modal);
            }
        },
        title, 
        children, 
        color_title="text-slate-800",
        bg_color="bg-white",
        no_body = false
    }) => {
    if (!isOpen) return null;
    // Basta receber uma prop 'id' e repassá-la no atributo id (ou repassar qualquer outra prop para <div>):
    return e(
        'div',
        { 
            id: "modal_close", // agora o id é dinâmico (via props)
            className: `fixed inset-0 z-50 flex items-center justify-center p-4`,
        },
        // Fundo escurecido — clicar nele fecha o modal!
        e('div', { className: "absolute inset-0 bg-slate-900/40 backdrop-blur-sm", onClick: onClose }),
        // Caixa principal do modal
        e('div',
            {
                className:
                    `relative w-full max-w-lg ${bg_color} rounded-2xl shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in duration-200`
            },
            // Cabeçalho do modal
            e('div', { className: `flex items-center justify-between p-6 ${no_body ? '' : "border-b border-slate-100"}` },
                e('h3', { className: `text-xl font-bold ${color_title}` }, title),
                e('button', { onClick: onClose, className: "text-slate-400 hover:text-slate-600", 'aria-label': 'Fechar' }, "✕")
            ),
            // Corpo do modal
            no_body ? '' : e('div', { className: "p-6" }, children)
        )
    );
};
