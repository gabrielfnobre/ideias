/**
 * ============================================================================
 * AuthModal – Modal de Autenticação (Login e Cadastro) SUPER DOCUMENTADO
 * ============================================================================
 *
 * O QUE ESSE COMPONENTE FAZ?
 * ---------------------------------------------------------
 * Permite ao usuário se autenticar na aplicação tanto fazendo login
 * quanto criando uma nova conta (cadastro), de forma simples,
 * guiada, segura e transparente para qualquer pessoa utilizar.
 *
 * COMO FUNCIONA O FLUXO DO COMPONENTE?
 * ---------------------------------------------------------
 * 1) Recebe três propriedades obrigatórias:
 *    - isOpen (boolean): controla se o modal aparece ou não na tela.
 *    - onClose (function): fecha o modal. ESSENCIAL para não travar a interface.
 *    - onSuccess (function): chamada com o usuário autenticado ao logar/cadastrar bem-sucedido.
 *
 * 2) O usuário pode alternar entre "Entrar" (login) e "Criar Conta" (cadastro):
 *    - No modo LOGIN só pede e-mail e senha.
 *    - No modo CADASTRO pede nome completo, e-mail e senha.
 *    - A UI muda conforme o modo, simplificando a experiência do usuário.
 *
 * 3) Ao clicar no botão principal:
 *    - Valida e envia os dados para a API correta (api.login ou api.signup).
 *    - Enquanto aguarda, desabilita o botão e mostra que está processando ("Processando...").
 *    - Se houver um erro (problema de rede, senha incorreta, etc), destaca a mensagem de erro.
 *    - Se for sucesso, executa onSuccess(user) com os dados do usuário e fecha o modal.
 *    - O componente não mistura lógica de autenticação — só cuida da experiência do usuário!
 *
 * PRINCIPAIS CUIDADOS E DICAS PARA QUEM FOR MEXER:
 * ---------------------------------------------------------
 * - Nunca coloque aqui regras de autenticação. Isso deve ficar só na API/serviço.
 * - Se adicionar/alterar campos, atualize o objeto formData e a lógica do formulário.
 * - Não misture esse componente com outras lógicas do sistema (é SÓ para login/cadastro).
 * - Ao trocar de modo, os campos são reaproveitados.
 * - O feedback de erro é sempre exibido de forma clara para o usuário.
 *
 * EXEMPLO DE USO:
 * <AuthModal
 *    isOpen={mostrarModal}
 *    onClose={() => setMostrarModal(false)}
 *    onSuccess={usuario => setUsuarioAutenticado(usuario)}
 * />
 *
 * 100% em português e didático para facilitar colaboração!
 */

import { api } from '../services/api.js';
import { Modal, Input, Button } from './ui/index.js';
const e = React.createElement;

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    /**
     * mode: controla se o formulário está no modo "login" (entrar) ou "signup" (cadastro).
     * Possíveis valores: 'login' ou 'signup'
     */
    const [mode, setMode] = React.useState('login');

    /**
     * loading: indica se uma requisição está em andamento.
     * Enquanto verdadeiro, o botão principal fica desabilitado e o texto mostra "Processando..."
     */
    const [loading, setLoading] = React.useState(false);

    /**
     * error: guarda qualquer mensagem de erro vinda da API, do backend
     * ou do próprio fluxo de validação/negócio.
     * Sempre destacado de forma clara ao usuário.
     */
    const [error, setError] = React.useState('');

    /**
     * formData: objeto que armazena os valores atuais dos campos do formulário.
     * Campos:
     *   - name: Nome completo (aparece somente no cadastro)
     *   - email: Email corporativo para login/cadastro
     *   - password: Senha de acesso
     * Sempre mantenha esse objeto atualizado se adicionar mais campos!
     */
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    });

    /**
     * Atualiza dinamicamente o valor de um campo do formulário.
     * @param {string} field - nome do campo (ex: 'name', 'email', 'password')
     * @param {string} value - novo valor a ser armazenado
     */
    const handleChange = (field, value) =>
        setFormData(prev => ({ ...prev, [field]: value }));

    /**
     * Função disparada ao tentar enviar o formulário (login ou cadastro)
     * - Define loading no início e ao final.
     * - Chama a API correspondente ao modo atual.
     * - Controla todos os estados de erro.
     * - Garante que nada aconteça em paralelo enquanto já está processando.
     */
    const handleSubmit = async () => {
        setLoading(true);      // Sinaliza que está processando para o usuário
        setError('');          // Limpa erros anteriores
        let res;
        try {
            if (mode === 'login') {
                // LOGIN: envia só e-mail e senha para a API
                res = await api.login({ email: formData.email, password: formData.password });
            } else {
                // CADASTRO: envia nome, e-mail e senha (pode adaptar se houver campos extra)
                res = await api.signup(formData);
            }
        } catch (err) {
            // Erros inesperados de rede, backend fora, etc
            setError('Falha na conexão. Tente de novo.');
            setLoading(false);
            return;
        }

        if (res.ok) {
            // Autenticação OU cadastro ok!
            onSuccess(res.user); // Dispara retorno do usuário autenticado
            onClose(); // Fecha o modal após o sucesso
        } else {
            // Destaca erro para o usuário com mensagem amigável se possível
            setError(res.error || 'Erro na autenticação');
        }
        setLoading(false); // Libera novamente o botão/interação
    };

    /**
     * Renderização do modal.
     * - Componente Modal recebe isOpen, onClose e título personalizado conforme o modo.
     * - Todos os campos são desenhados com Input e Button da nossa lib de UI.
     * - Feedback de erro, loading e alternância de modos ficam super claros.
     */
    return e(Modal, {
        isOpen,
        onClose,
        title: mode === 'login' ? 'Entrar na Central' : 'Criar Conta'
    },
        e('div', { className: "space-y-4" },
            // Mostra uma caixa de erro visível caso exista error
            error && e('div', {
                className: "bg-red-50 text-red-600 p-3 rounded-lg text-sm"
            }, error),

            // Campo "Nome Completo" só aparece ao cadastrar (signup)
            mode === 'signup' && e(Input, {
                label: "Nome Completo",
                id: "auth-name",
                value: formData.name,
                onChange: e => handleChange('name', e.target.value)
            }),

            // Campo E-mail (sempre obrigatório)
            e(Input, {
                label: "E-mail Corporativo",
                id: "auth-email",
                type: "email",
                value: formData.email,
                onChange: e => handleChange('email', e.target.value)
            }),

            // Campo Senha (sempre obrigatório)
            e(Input, {
                label: "Senha",
                id: "auth-pass",
                type: "password",
                value: formData.password,
                onChange: e => handleChange('password', e.target.value)
            }),

            // Botão principal: faz login ou cria conta
            e(Button, {
                className: "w-full mt-6",
                onClick: handleSubmit,
                disabled: loading // Não permite clicar mais de uma vez
            },
                loading
                    ? "Processando..." // Mostra que está carregando após clicar
                    : (mode === 'login' ? "Entrar" : "Cadastrar") // Label muda pelo modo
            ),

            // Rodapé: permite alternar entre login/cadastro de forma amigável
            e('div', { className: "text-center text-sm text-slate-500 mt-4" },
                mode === 'login'
                    ? "Não tem conta? "
                    : "Já tem conta? ",
                e('button', {
                    className: "text-blue-600 font-bold hover:underline",
                    onClick: () => setMode(mode === 'login' ? 'signup' : 'login')
                },
                    mode === 'login'
                        ? "Cadastre-se"
                        : "Faça Login"
                )
            )
        )
    );
};
