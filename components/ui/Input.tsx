import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className,
  ...props
}: InputProps) {
  return (
    <input
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
}