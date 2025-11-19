import { Button } from './ui/index.js';
const e = React.createElement;

export const Header = ({ user, onLogout, onOpenAuth, currentView, setView, onCreateIdea }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const navItems = [
        { id: 'Home', label: 'Home' },
        { id: 'Dashboard', label: 'Dashboard' },
        { id: 'Kanban', label: 'Kanban' },
        { id: 'Campanhas', label: 'Campanhas' },
        { id: 'Recompensas', label: 'Loja' },
    ];

    const handleNavClick = (id) => {
        setView(id);
        setIsMobileMenuOpen(false);
    };

    const handleCreateClick = () => {
        onCreateIdea();
        setIsMobileMenuOpen(false);
    };

    return e('header', { className: "sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200" },
        e('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
            e('div', { className: "flex justify-between items-center h-16" },
                // Logo Area
                e('div', { className: "flex items-center gap-3 cursor-pointer", onClick: () => handleNavClick('Home') },
                    e('img', { src: 'logo.png', alt: 'PROENG', className: "h-8 w-auto" }),
                    e('div', { className: "hidden md:block" },
                        e('h1', { className: "text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600" }, "Innovation Hub"),
                        e('p', { className: "text-[10px] text-slate-500 uppercase tracking-wider font-semibold" }, "Central de Ideias")
                    )
                ),

                // Desktop Nav
                e('nav', { className: "hidden md:flex items-center gap-1" },
                    navItems.map(item =>
                        e('button', {
                            key: item.id,
                            onClick: () => setView(item.id),
                            className: `px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentView === item.id
                                ? "bg-blue-50 text-blue-700"
                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                }`
                        }, item.label)
                    ),
                    // Nova Ideia Button (Desktop)
                    e(Button, { onClick: onCreateIdea, className: "ml-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30" }, "+ Nova Ideia")
                ),

                // User Area & Mobile Toggle
                e('div', { className: "flex items-center gap-3" },
                    user ? e(React.Fragment, null,
                        e('div', { className: "text-right hidden sm:block" },
                            e('div', { className: "text-sm font-medium text-slate-900" }, user.name),
                            e('div', { className: "text-xs text-slate-500" }, `${user.points || 0} pts`)
                        ),
                        e(Button, { variant: 'ghost', onClick: onLogout, className: "!px-2 hidden md:block" }, "Sair")
                    ) : e(Button, { onClick: onOpenAuth, className: "hidden md:block" }, "Entrar"),

                    // Mobile Menu Button
                    e('button', {
                        className: "md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100",
                        onClick: () => setIsMobileMenuOpen(!isMobileMenuOpen)
                    },
                        e('span', { className: "text-xl" }, isMobileMenuOpen ? '✕' : '☰')
                    )
                )
            ),

            // Mobile Menu Dropdown
            isMobileMenuOpen && e('div', { className: "md:hidden border-t border-slate-100 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200" },
                navItems.map(item =>
                    e('button', {
                        key: item.id,
                        onClick: () => handleNavClick(item.id),
                        className: `w-full text-left px-4 py-3 rounded-lg text-base font-medium ${currentView === item.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-slate-600 hover:bg-slate-50"
                            }`
                    }, item.label)
                ),
                // Nova Ideia Button (Mobile)
                e('button', {
                    onClick: handleCreateClick,
                    className: "w-full text-left px-4 py-3 rounded-lg text-base font-medium text-blue-600 bg-blue-50"
                }, "+ Nova Ideia"),

                e('div', { className: "pt-4 border-t border-slate-100 px-4" },
                    user ? e(React.Fragment, null,
                        e('div', { className: "mb-3" },
                            e('div', { className: "font-medium text-slate-900" }, user.name),
                            e('div', { className: "text-sm text-slate-500" }, `${user.points || 0} pts`)
                        ),
                        e(Button, { variant: 'ghost', onClick: onLogout, className: "w-full justify-start" }, "Sair")
                    ) : e(Button, { onClick: onOpenAuth, className: "w-full" }, "Entrar")
                )
            )
        )
    );
};
