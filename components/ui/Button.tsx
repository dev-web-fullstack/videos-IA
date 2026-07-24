import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        w-full
        rounded-lg
        bg-green-600
        hover:bg-green-500
        active:scale-95
        transition
        p-3
        font-bold
        disabled:bg-gray-700
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className ?? ""}
      `}
    >
      {children}
    </button>
  );
}