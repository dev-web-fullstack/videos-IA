import { SelectHTMLAttributes } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
}

export default function Select({
  options,
  className,
  ...props
}: SelectProps) {
  return (
    <select
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
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}