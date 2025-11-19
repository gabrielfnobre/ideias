import { api } from './services/api.js';
import { Header } from './components/Header.js';
import { HomeView } from './components/HomeView.js';
import { DashboardView } from './components/DashboardView.js';
import { KanbanView } from './components/KanbanView.js';
import { CampaignsView } from './components/CampaignsView.js';
import { IdeaDetailView } from './components/IdeaDetailView.js';
import { RewardsView } from './components/RewardsView.js';
import { AuthModal } from './components/AuthModal.js';
import { CreateIdeaModal } from './components/CreateIdeaModal.js';

const e = React.createElement;

const App = () => {
    const [user, setUser] = React.useState(null);
    const [view, setView] = React.useState('Home');
    const [authOpen, setAuthOpen] = React.useState(false);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [selectedIdea, setSelectedIdea] = React.useState(null);

    // Check session on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const handleLogin = (u) => {
        setUser(u);
        localStorage.setItem('user', JSON.stringify(u));
    };

    const handleLogout = async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('user');
        setView('Home');
    };

    const handleCreateClick = () => {
        if (!user) {
            setAuthOpen(true);
        } else {
            setCreateOpen(true);
        }
    };

    const renderView = () => {
        const commonProps = { onOpenAuth: () => setAuthOpen(true) };

        switch (view) {
            case 'Home': return e(HomeView, { ...commonProps, onOpenIdea: (idea) => { setSelectedIdea(idea); setView('IdeaDetail'); } });
            case 'Dashboard': return e(DashboardView);
            case 'Kanban': return e(KanbanView, commonProps);
            case 'Campanhas': return e(CampaignsView);
            case 'Recompensas': return e(RewardsView, { userPoints: user ? user.points : 0 });
            case 'IdeaDetail': return e(IdeaDetailView, { ...commonProps, idea: selectedIdea, onBack: () => setView('Home') });
            default: return e(HomeView, commonProps);
        }
    };

    return e('div', { className: "min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100" },
        e(Header, {
            user,
            onLogout: handleLogout,
            onOpenAuth: () => setAuthOpen(true),
            currentView: view,
            setView: setView,
            onCreateIdea: handleCreateClick
        }),

        e('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
            renderView()
        ),

        e(AuthModal, {
            isOpen: authOpen,
            onClose: () => setAuthOpen(false),
            onSuccess: handleLogin
        }),

        e(CreateIdeaModal, {
            isOpen: createOpen,
            onClose: () => setCreateOpen(false),
            onSuccess: () => {
                // Refresh view if needed, or just close
                if (view === 'Home' || view === 'Kanban') {
                    // Ideally trigger a reload in the child component,
                    // but for now a simple view reset or just closing is fine.
                    // The user will see the new idea on refresh or if we implemented a global refresh context.
                    // For simplicity:
                    window.location.reload();
                }
            }
        })
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(e(App));
