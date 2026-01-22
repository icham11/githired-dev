import { motion } from "framer-motion";

const Button = ({
  onClick,
  children,
  className = "",
  variant = "primary",
  disabled = false,
  type = "button",
  size = "md",
}) => {
  const baseStyles =
    "font-sans font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden group";

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-8 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  const variants = {
    primary:
      "bg-champion-gold text-champion-dark hover:bg-white hover:text-black shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]",
    secondary:
      "bg-transparent text-champion-gold border border-champion-gold/30 hover:border-champion-gold hover:bg-champion-gold/10",
    outline:
      "text-champion-silver border border-champion-silver/20 hover:border-white hover:text-white",
    danger:
      "bg-red-900/20 text-red-500 border border-red--900/50 hover:bg-red-600 hover:text-white hover:border-red-600",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      )}
    </motion.button>
  );
};

export default Button;
