const Button = ({
  onClick,
  children,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
}) => {
  const baseStyles =
    "px-6 py-2.5 rounded-full font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black active:scale-95";
  const variants = {
    primary: "btn-luxury-primary",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-white/5 hover:border-white/10 shadow-lg",
    outline:
      "border border-amber-500/50 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500 shadow-amber-900/20 shadow-lg",
    danger:
      "bg-red-900/20 border border-red-500/50 text-red-500 hover:bg-red-900/40 hover:border-red-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
