// components/ui/Textarea.tsx
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id?: string;
  name?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className,
  id,
  name,
  ...props
}, ref) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substring(7)}`;

  return (
    <textarea
      ref={ref}
      id={textareaId}
      name={name || textareaId}
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
});

Textarea.displayName = 'Textarea';

export default Textarea;