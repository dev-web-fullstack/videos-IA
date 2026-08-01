// components/ui/Select.tsx
import { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Option[];
  id?: string;
  name?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  options,
  className,
  id,
  name,
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substring(7)}`;

  return (
    <select
      ref={ref}
      id={selectId}
      name={name || selectId}
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
});

Select.displayName = 'Select';

export default Select;