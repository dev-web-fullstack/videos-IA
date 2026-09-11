// components/form/ScriptInput.tsx
"use client";

import { FileText } from "lucide-react";

interface ScriptInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  maxLength?: number;
}

export default function ScriptInput({
  value,
  onChange,
  id = "script-input",
  name = "script",
  disabled = false,
  maxLength = 5000,
}: ScriptInputProps) {
  const charCount = value.length;

  return (
    <section className="space-y-2">
      {/* Label + Contador na mesma linha */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-gray-300 flex items-center gap-2"
        >
          <FileText className="w-4 h-4 text-blue-400" />
          Texto do vídeo
        </label>
        <span className={`text-xs ${charCount > maxLength ? 'text-red-400' : 'text-gray-400'}`}>
          {charCount}/{maxLength}
        </span>
      </div>

      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite ou cole aqui o roteiro do vídeo..."
        disabled={disabled}
        className="w-full h-32 rounded-lg bg-gray-800/50 border border-gray-700/50 p-3 text-white text-sm placeholder-gray-500 focus:border-purple-500/50 focus:outline-none resize-none"
      />
    </section>
  );
}