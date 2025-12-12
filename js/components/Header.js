import { Button } from './ui/index.js';
import { api } from '../services/api.js';
const e = React.createElement;

/**
 * ========================================================================================
 * Header
 * ========================================================================================
 * 
 * COMPONENTE: BARRA DE NAVEGAÇÃO SUPERIOR RESPONSIVA
 * 
 * O Header é a barra fixa no topo da plataforma, responsável por:
 *  - Exibir o logo e título do sistema ("Innovation Hub", "Central de Ideias")
 *  - Navegação principal entre as seções do sistema (Home, Dashboard, Kanban, Campanhas, Loja)
 *  - Exibir informações do usuário (nome e pontos) caso esteja logado
 *  - Oferecer botões de ação: "Entrar", "Sair" e "+ Nova Ideia"
 *  - Oferecer menu hambúrguer para navegação responsiva no mobile
 *  - Sempre mostrar de forma clara qual seção/aba está ativa
 * 
 * === PROPRIEDADES ===
 * 
 * @param {object|null} user         Objeto usuário logado. Se null, exibe botão "Entrar" e esconde pontuação.
 * @param {function} onLogout        Função chamada ao clicar "Sair"; ideal para limpar sessão e redirecionar.
 * @param {function} onOpenAuth      Função chamada ao clicar "Entrar"; normalmente mostra modal de login.
 * @param {string} currentView       String indicando a aba/tela/seção atualativa, usada para destacar navegação.
 * @param {function} setView         Função que recebe o id da aba/tela a ser ativada (ex: setView('Kanban')).
 * @param {function} onCreateIdea    Função chamada ao clicar "+ Nova Ideia"; normalmente abre modal.
 * 
 * === RESUMO FUNCIONAL ===
 * 
 * DESKTOP:
 *  - Mostra logo/título à esquerda (sempre volta para Home ao clicar).
 *  - Abas do menu visíveis horizontalmente. Aba ativa fica em destaque.
 *  - Botão "+ Nova Ideia" sempre visível na barra.
 *  - Se usuário logado: mostra nome, pontos e botão "Sair".
 *  - Se NÃO logado: mostra só o botão "Entrar".
 * 
 * MOBILE:
 *  - Mostra hambúrguer (☰). Ao clicar, expande menu vertical com:
 *      - Abas de navegação (com destaque para a ativa).
 *      - Botão "+ Nova Ideia".
 *      - Info de usuário logado (nome, pontos, "Sair") ou só botão "Entrar".
 * 
 * USABILIDADE:
 *  - O clique em qualquer aba/tela fecha, se preciso, o menu mobile.
 *  - Sempre use as funções/props adequadas para garantir fluxo correto.
 * 
 * OBSERVAÇÕES:
 *  - Layout e classes definidos para manter padrão visual claro e elegante.
 *  - Como React.createElement, não utiliza JSX. Trocas de view/modal feitas por funções recebidas.
 *  - Evite alterações no comportamento sem ler esta documentação.
 *
 * EXEMPLO DE USO:
 * 
 * <Header
 *    user={usuarioAtual}
 *    onLogout={() => logoutUser()}
 *    onOpenAuth={() => setShowAuth(true)}
 *    currentView={view}
 *    setView={setView}
 *    onCreateIdea={() => setShowCreateIdea(true)}
 * />
 */

export const Header = ({
    user,
    onLogout,
    onOpenAuth,
    currentView,
    setView,
    onCreateIdea
}) => {

    /**
     * Estado local:
     * isMobileMenuOpen: controla abertura do menu lateral/hambúrguer no mobile.
     */
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [showUserModal, setShowUserModal] = React.useState(false);
    const [matriculaInput, setMatriculaInput] = React.useState(false);
    const [erroMatricula, setErroMatricula] = React.useState(false);
    const [userPhoto, setUserPhoto] = React.useState('');

    console.log(JSON.parse(localStorage.getItem('user')));

    // O problema está no array de dependências e lógica do useEffect.
    // Você está dependendo de [userPhoto], porém deveria depender de [user]
    // para buscar a foto sempre que mudar o usuário.
    // Além disso, você precisa atualizar o estado com a foto recebida.
    // Assim, evita o ciclo duplo e processa na hora certa.

    // Remova logs depois de debugar.
    React.useEffect(() => {
        if (user && user.register) {
            api.getUserPhoto(user.register).then(res => {
                if (res && res.ok && res.photo) {
                    setUserPhoto(`./../conectarh/fotos/${res.photo}`);
                    setErroMatricula(false);
                } else {
                    // Se não encontrar ou erro, zere/coloque placeholder e marque erro se quiser.
                    setUserPhoto('');
                    setErroMatricula(true);
                }
            }).catch(() => {
                setUserPhoto('');
                setErroMatricula(true);
            });
        } else {
            setUserPhoto('');
        }
    }, [user]);

    /**
     * navItems: Define as seções principais disponíveis no sistema.
     * ATENÇÃO: Para adicionar/remover/trocar seções, atualize esta lista.
     * - id: identificador único e usado pela navegação.
     * - label: texto exibido no menu (ex.: "Loja" para "Recompensas")
     */
    const navItems = [
        { id: 'Home', label: 'Home' },
        { id: 'Dashboard', label: 'Dashboard' },
        { id: 'Kanban', label: 'Kanban' },
        { id: 'Campanhas', label: 'Campanhas' },
        { id: 'Recompensas', label: 'Loja' }
    ];

    /**
     * handleNavClick:
     * Quando o usuário clica em uma aba/tela do menu, faz:
     *  - Troca a tela/aba ativa via setView.
     *  - Fecha o menu mobile se estava aberto.
     * @param {string} id  id da tela/aba.
     */
    const handleNavClick = (id) => {
        setView(id);
        setIsMobileMenuOpen(false);
    };

    /**
     * handleCreateClick:
     * Ao clicar "+ Nova Ideia", executa a função recebida na prop e garante fechamento do menu mobile.
     */
    const handleCreateClick = () => {
        onCreateIdea();
        setIsMobileMenuOpen(false);
    };

    // ==== MODAL PARA USUÁRIO ====
    const modal = showUserModal ? 
        e('div', {
            className: "fixed z-[100] inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm",
            onClick: (e_) => {
                if (e_.target === e_.currentTarget) setShowUserModal(false);
            },
        },
            e('div', {
                className: "bg-white rounded-xl shadow-2xl max-w-xs w-full p-6 flex flex-col items-center relative"
            },
                e('button', {
                    className: "absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-2xl font-bold",
                    onClick: () => setShowUserModal(false),
                    tabIndex: 0,
                    'aria-label': "Fechar modal"
                }, '×'),
                user && e(React.Fragment, null,
                    e('div', {
                        className: "w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300 mb-3"
                    },
                        user.register
                            ? e('img', {
                                src: userPhoto,
                                alt: user.name,
                                className: "w-full h-full object-cover"
                            })
                            : e('span', {
                                className: "text-slate-400 text-2xl select-none"
                            }, user.name && user.name[0] ? user.name[0].toUpperCase() : 'U')
                    ),
                    e('div', {
                            className: "text-lg font-semibold text-slate-900 text-center mb-1"
                        },
                        user.register ? user.name : [
                            e('div', {
                                className: "text-sm font-medium text-slate-900"
                            }, user.name),
                            e('div', {
                                className: "text-xs text-slate-500"
                            }, `${user.points || 0} pts`),
                            e('div', { className: "flex flex-col items-center w-full mb-4 mt-4" },
                                e('input', {
                                    type: "text",
                                    inputMode: "numeric",
                                    pattern: "[0-9]*",
                                    maxLength: 6,
                                    value: matriculaInput || "",
                                    onChange: (e_) => {
                                        // Apenas números, máximo 6 caracteres
                                        const val = e_.target.value.replace(/\D/g, '').slice(0,6);
                                        setMatriculaInput(val);
                                        if (erroMatricula) setErroMatricula('');
                                    },
                                    placeholder: "Digite sua Matrícula (6 dígitos)",
                                    className: "w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2 focus:outline-none focus:ring focus:border-blue-400"
                                }),
                                erroMatricula && e('div', { className: "text-red-500 text-xs mb-2 w-full text-center" }, erroMatricula),
                                e(Button, {
                                    className: "text-sm text-slate-500 text-center",
                                    onClick: () => {
                                        let val = matriculaInput || "";
                                        // Completar com zeros à esquerda
                                        val = val.padStart(6, '0');
                                        if (!/^\d{6}$/.test(val)) {
                                            setErroMatricula("A matrícula deve conter exatamente 6 dígitos numéricos.");
                                            return;
                                        }
                                        setErroMatricula('');
                                        handleMatriculaSubmit(val);
                                    },
                                }, "Adicione sua Matrícula")
                            )
                        ]
                    ) 
                )
            )
        ) : null;

    async function handleMatriculaSubmit(val){
        let resp = await api.getUserPhoto(val);
        if(resp.ok && user){
            api.setRegister(user.id, val);
            const user_local = localStorage.getItem('user');
            if(user_local){
                let local_storage_json = JSON.parse(user_local);
                local_storage_json.register = val;
                local_storage_json = JSON.stringify(local_storage_json);
                localStorage.setItem('user', local_storage_json);
                window.location.reload();
            }
        }
    }

    // ---- RENDERIZAÇÃO VISUAL ----
    return e(React.Fragment, null, 
        modal,
        e('header', {
            className: "sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200"
        },
        // Conteúdo centralizado, com responsividade máxima para desktop/telas grandes
        e('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
            // Linha principal do header: logo/título | menu | infos/ações de usuário
            e('div', { className: "flex justify-between items-center h-16" },
                // === LOGO + TÍTULO ===
                e('div', {
                        className: "flex items-center gap-3 cursor-pointer",
                        onClick: () => handleNavClick('Home') // Clicou no logo? Vai para Home.
                    },
                    // Logo do sistema
                    e('img', {
                        src: 'logo.png',
                        alt: 'PROENG',
                        className: "h-8 w-auto"
                    }),
                    // Título, só aparece em telas médias+ (tela >= md)
                    e('div', { className: "hidden md:block" },
                        e('h1', {
                            className: "text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600"
                        }, "Innovation Hub"),
                        e('p', {
                            className: "text-[10px] text-slate-500 uppercase tracking-wider font-semibold"
                        }, "Central de Ideias")
                    )
                ),
                // === MENU PRINCIPAL DESKTOP ===
                e('nav', { className: "hidden md:flex items-center gap-1" },
                    navItems.map(item => {
                        if(!user && (item.id == 'Dashboard' || item.id == 'Kanban')){
                            return;
                        }

                        // Um botão por seção. Se for a atual, destaque visual.
                        return e('button', {
                            key: item.id,
                            onClick: () => setView(item.id),
                            className:
                                `px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                    currentView === item.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                        }, item.label)
                    }

                        
                    ),
                    // Botão "+ Nova Ideia" (criação rápida). Só aparece aqui (desktop).
                    e(Button, {
                        onClick: onCreateIdea,
                        className:
                            "ml-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                    }, "+ Nova Ideia")
                ),
                // === SEÇÃO INFO DO USUÁRIO E MENU MOBILE ===
                e('div', {className: "flex items-center gap-3"},
                    user ? 
                    e(React.Fragment, null,
                        e('div', {
                                className: "flex gap-3 transition-transform duration-150 hover:scale-105 cursor-pointer",
                                // Exemplo: ao clicar, abre modal do usuário
                                onClick: () => {
                                    setShowUserModal(true);
                                },  
                            },
                            // Se logado: mostra nome e pontos (desktop >= sm)
                            e('div', { className: "text-right hidden sm:block" },
                                e('div', {
                                    className: "text-sm font-medium text-slate-900"
                                }, user.name),
                                e('div', {
                                    className: "text-xs text-slate-500"
                                }, `${user.points || 0} pts`)
                            ),
                            // Foto redonda do usuário (desktop >= sm)
                            e('div', { className: "hidden sm:flex items-center mr-2" },
                                e('div', {
                                    className: "w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center border border-slate-300"
                                },
                                    user.register
                                        ? e('img', {
                                            src: userPhoto,
                                            alt: user.name,
                                            className: "w-full h-full object-cover"
                                        })
                                        : e('span', {
                                            className: "text-slate-400 text-lg select-none"
                                        }, user.name && user.name[0] ? user.name[0].toUpperCase() : 'U')
                                )
                            ),
                        ),
                        // Botão Sair (desktop >= md)
                        e(Button, {
                            variant: 'ghost',
                            onClick: onLogout,
                            className: "!px-2 hidden md:block"
                        }, "Sair")
                    ) : (
                        // Se não está logado, mostra "Entrar"
                        e(Button, {
                            onClick: onOpenAuth,
                            className: "hidden md:block"
                        }, "Entrar")
                    ),
                    // Botão hambúrguer (☰): só aparece em telas menores que md
                    e('button', {
                        className: "md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100",
                        onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen)
                    },
                        e('span', { className: "text-xl" },
                            isMobileMenuOpen ? '✕' : '☰'
                        )
                    )
                )
            ),
            // === MENU MOBILE DROPDOWN (só aparece se menu aberto) ===
            isMobileMenuOpen && e('div', {
                className: "md:hidden border-t border-slate-100 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200"
            },
                // Navegação principal (versão vertical para mobile)
                navItems.map(item =>
                    e('button', {
                        key: item.id,
                        onClick: () => handleNavClick(item.id),
                        className:
                            `w-full text-left px-4 py-3 rounded-lg text-base font-medium ${
                                currentView === item.id
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:bg-slate-50"
                            }`
                    }, item.label)
                ),
                // Botão "+ Nova Ideia" (mobile)
                e('button', {
                    onClick: handleCreateClick,
                    className: "w-full text-left px-4 py-3 rounded-lg text-base font-medium text-blue-600 bg-blue-50"
                }, "+ Nova Ideia"),
                // Seção usuário mobile: nome/pontos/"Sair" OU só "Entrar" se não logado
                e('div', {
                    className: "pt-4 border-t border-slate-100 px-4"
                },
                    user ? e(React.Fragment, null,
                        e('div', { className: "mb-3" },
                            e('div', {
                                className: "font-medium text-slate-900"
                            }, user.name),
                            e('div', {
                                className: "text-sm text-slate-500"
                            }, `${user.points || 0} pts`)
                        ),
                        e(Button, {
                            variant: 'ghost',
                            onClick: onLogout,
                            className: "w-full justify-start"
                        }, "Sair")
                    ) : (
                        e(Button, {
                            onClick: onOpenAuth,
                            className: "w-full"
                        }, "Entrar")
                    )
                )
            )
        )
    )
    );
};




