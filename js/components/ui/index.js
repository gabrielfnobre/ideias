const e = React.createElement;

export const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, ...props }) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.02]",
        secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-300",
        ghost: "text-slate-600 hover:bg-slate-100",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
    };

    return e('button', {
        className: `${baseClass} ${variants[variant]} ${className}`,
        onClick,
        disabled,
        ...props
    }, children);
};

export const Card = ({ children, className = '', ...props }) => {
    return e('div', {
        className: `bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-slate-200/50 rounded-2xl p-6 ${className}`,
        ...props
    }, children);
};

export const Input = ({ label, id, className = '', ...props }) => {
    return e('div', { className: "space-y-1" },
        label && e('label', { htmlFor: id, className: "block text-sm font-medium text-slate-700" }, label),
        e('input', {
            id,
            className: `w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all ${className}`,
            ...props
        })
    );
};

export const Badge = ({ children, variant = 'default' }) => {
    const variants = {
        default: "bg-slate-100 text-slate-600",
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        warning: "bg-amber-100 text-amber-700 border border-amber-200",
        info: "bg-blue-100 text-blue-700 border border-blue-200",
        purple: "bg-purple-100 text-purple-700 border border-purple-200"
    };
    return e('span', { className: `px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}` }, children);
};

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return e('div', { className: "fixed inset-0 z-50 flex items-center justify-center p-4" },
        e('div', { className: "absolute inset-0 bg-slate-900/40 backdrop-blur-sm", onClick: onClose }),
        e('div', { className: "relative w-full max-w-lg bg-white rounded-2xl shadow-2xl shadow-blue-900/20 animate-in fade-in zoom-in duration-200" },
            e('div', { className: "flex items-center justify-between p-6 border-b border-slate-100" },
                e('h3', { className: "text-xl font-bold text-slate-800" }, title),
                e('button', { onClick: onClose, className: "text-slate-400 hover:text-slate-600" }, "✕")
            ),
            e('div', { className: "p-6" }, children)
        )
    );
};
