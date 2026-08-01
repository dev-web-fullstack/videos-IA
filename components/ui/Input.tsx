// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  name?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className,
  id,
  name,
  ...props
}, ref) => {
  // Gerar um id único se não for fornecido
  const inputId = id || name || `input-${Math.random().toString(36).substring(7)}`;

  return (
    <input
      ref={ref}
      id={inputId}
      name={name || inputId}
      {...props}
      className={`
        w-full
        rounded-lg
        bg-gray-300
        border
        border-gray-700
        p-3
        outline-none
        transition
        focus:border-green-500
        ${className ?? ""}
      `}
    />
  );
});

Input.displayName = 'Input';

export default Input;