import { api } from '../services/api.js';
import { Modal, Input, Button } from './ui/index.js';
const e = React.createElement;

export const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const [mode, setMode] = React.useState('login'); // login | signup
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        let res;
        if (mode === 'login') {
            res = await api.login({ email: formData.email, password: formData.password });
        } else {
            res = await api.signup(formData);
        }

        if (res.ok) {
            onSuccess(res.user);
            onClose();
        } else {
            setError(res.error || 'Erro na autenticação');
        }
        setLoading(false);
    };

    return e(Modal, {
        isOpen,
        onClose,
        title: mode === 'login' ? 'Entrar na Central' : 'Criar Conta'
    },
        e('div', { className: "space-y-4" },
            error && e('div', { className: "bg-red-50 text-red-600 p-3 rounded-lg text-sm" }, error),

            mode === 'signup' && e(Input, {
                label: "Nome Completo",
                id: "auth-name",
                value: formData.name,
                onChange: e => handleChange('name', e.target.value)
            }),

            e(Input, {
                label: "E-mail Corporativo",
                id: "auth-email",
                type: "email",
                value: formData.email,
                onChange: e => handleChange('email', e.target.value)
            }),

            e(Input, {
                label: "Senha",
                id: "auth-pass",
                type: "password",
                value: formData.password,
                onChange: e => handleChange('password', e.target.value)
            }),

            e(Button, {
                className: "w-full mt-6",
                onClick: handleSubmit,
                disabled: loading
            }, loading ? "Processando..." : (mode === 'login' ? "Entrar" : "Cadastrar")),

            e('div', { className: "text-center text-sm text-slate-500 mt-4" },
                mode === 'login' ? "Não tem conta? " : "Já tem conta? ",
                e('button', {
                    className: "text-blue-600 font-bold hover:underline",
                    onClick: () => setMode(mode === 'login' ? 'signup' : 'login')
                }, mode === 'login' ? "Cadastre-se" : "Faça Login")
            )
        )
    );
};
