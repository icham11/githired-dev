// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  required = false,
  error,
}) => {
  return (
    <div className="mb-6 relative group">
      {label && (
        <label
          className="block text-xs uppercase tracking widest text-gray-500 mb-2 font-heading group-focus-within:text-champion-gold transition-colors"
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          className={`w-full bg-white/5 border-b-2 text-white px-4 py-3 focus:outline-none transition-all duration-300 placeholder-transparent md:placeholder-gray-700
            ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-800 focus:border-champion-gold focus:bg-white/10"
            }
                `}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        {!error && (
          <motion.div
            className="absolute bottom-0 left-0 h-[2px] bg-champion-gold"
            initial={{ width: "0%" }}
            whileFocus={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-xs text-red-500 font-bold uppercase tracking-wide"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
