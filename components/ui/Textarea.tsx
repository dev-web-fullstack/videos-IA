import { TextareaHTMLAttributes } from "react";

type TextareaProps =
  TextareaHTMLAttributes<HTMLTextAreaElement>;

export default function Textarea({
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`
        w-full
        h-60
        rounded-lg
        bg-gray-300
        border
        border-gray-700
        p-4
        resize-none
        outline-none
        transition
        focus:border-green-500
        ${className ?? ""}
      `}
    />
  );
}