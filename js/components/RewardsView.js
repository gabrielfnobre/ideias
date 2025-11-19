import { Card, Button, Badge } from './ui/index.js';
const e = React.createElement;

export const RewardsView = ({ userPoints = 0 }) => {
    const rewards = [
        { id: 1, title: "Almoço com o CEO", cost: 500, image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&q=80", desc: "Um almoço exclusivo para apresentar suas ideias diretamente à diretoria." },
        { id: 2, title: "Day Off (Folga)", cost: 1000, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80", desc: "Um dia inteiro de folga para você recarregar as energias." },
        { id: 3, title: "Voucher Livraria", cost: 200, image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&q=80", desc: "R$ 100,00 em livros técnicos ou de lazer." },
        { id: 4, title: "Curso Online Premium", cost: 800, image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80", desc: "Acesso a um curso de especialização na sua área." },
        { id: 5, title: "Kit Home Office", cost: 1500, image: "https://images.unsplash.com/photo-1493934558415-9d19f0b2b4d2?w=400&q=80", desc: "Upgrade no seu setup: Teclado mecânico, mouse e suporte." },
        { id: 6, title: "Ingresso para Conferência", cost: 1200, image: "https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=400&q=80", desc: "Participação em um evento de tecnologia ou inovação." }
    ];

    return e('div', { className: "space-y-8 animate-in fade-in duration-500" },
        // Hero Section
        e('div', { className: "relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white shadow-xl shadow-blue-500/20" },
            e('div', { className: "relative z-10 flex flex-col md:flex-row items-center justify-between gap-6" },
                e('div', null,
                    e('h2', { className: "text-3xl font-bold mb-2" }, "Loja de Recompensas"),
                    e('p', { className: "text-blue-100 max-w-xl" }, "Troque seus pontos de inovação por experiências incríveis e prêmios exclusivos. Continue colaborando para ganhar mais!")
                ),
                e('div', { className: "bg-white/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[150px]" },
                    e('div', { className: "text-xs font-medium text-blue-100 uppercase tracking-wider" }, "Seus Pontos"),
                    e('div', { className: "text-4xl font-bold" }, userPoints)
                )
            ),
            // Decorative circles
            e('div', { className: "absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" }),
            e('div', { className: "absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" })
        ),

        // Rewards Grid
        e('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
            rewards.map(item =>
                e(Card, { key: item.id, className: "flex flex-col h-full p-0 overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300" },
                    e('div', { className: "h-48 overflow-hidden relative" },
                        e('img', {
                            src: item.image,
                            alt: item.title,
                            className: "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        }),
                        e('div', { className: "absolute top-3 right-3" },
                            e(Badge, { variant: "info" }, `${item.cost} pts`)
                        )
                    ),
                    e('div', { className: "p-6 flex flex-col flex-1" },
                        e('h3', { className: "text-lg font-bold text-slate-800 mb-2" }, item.title),
                        e('p', { className: "text-sm text-slate-600 mb-6 flex-1" }, item.desc),
                        e(Button, {
                            variant: userPoints >= item.cost ? 'primary' : 'secondary',
                            disabled: userPoints < item.cost,
                            className: "w-full"
                        }, userPoints >= item.cost ? "Resgatar" : `Faltam ${item.cost - userPoints} pts`)
                    )
                )
            )
        )
    );
};
