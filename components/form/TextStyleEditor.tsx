"use client";

import Input from "../ui/Input";
import Select from "../ui/Select";

import type {
  TextStyle,
  TextAlign,
} from "../../lib/textStyle";

interface Props {
  value: TextStyle;
  onChange: (style: TextStyle) => void;

  showStyle?: boolean;
  showShadow?: boolean;
}

const fontOptions = [
  {
    value: "Roboto-Regular",
    label: "Roboto",
  },
  {
    value: "Arial",
    label: "Arial",
  },
  {
    value: "Verdana",
    label: "Verdana",
  },
  {
    value: "Tahoma",
    label: "Tahoma",
  },
];

const alignOptions = [
  {
    value: "left",
    label: "Esquerda",
  },
  {
    value: "center",
    label: "Centralizado",
  },
  {
    value: "right",
    label: "Direita",
  },
  {
    value: "justify",
    label: "Justificado",
  },
];

export default function TextStyleEditor({
  value,
  onChange,
  showStyle = true,
  showShadow = true,
}: Props) {

  function update<K extends keyof TextStyle>(
    key: K,
    newValue: TextStyle[K]
  ) {
    onChange({
      ...value,
      [key]: newValue,
    });
  }

  return (
    <section className="space-y-6">

      {showStyle && (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Fonte
              </label>

              <Select
                options={fontOptions}
                value={value.fontFamily}
                onChange={(e) =>
                  update("fontFamily", e.target.value)
                }
              />

            </div>

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Tamanho
              </label>

              <Input
                type="number"
                min={18}
                max={300}
                value={value.fontSize}
                onChange={(e) =>
                  update(
                    "fontSize",
                    Number(e.target.value)
                  )
                }
              />

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Cor
              </label>

              <Input
                type="color"
                value={value.color}
                onChange={(e) =>
                  update("color", e.target.value)
                }
              />

            </div>

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Contorno
              </label>

              <Input
                type="color"
                value={value.borderColor}
                onChange={(e) =>
                  update(
                    "borderColor",
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Espessura
              </label>

              <Input
                type="number"
                min={0}
                max={20}
                value={value.borderWidth}
                onChange={(e) =>
                  update(
                    "borderWidth",
                    Number(e.target.value)
                  )
                }
              />

            </div>

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Alinhamento
              </label>

              <Select
                options={alignOptions}
                value={value.align}
                onChange={(e) =>
                  update(
                    "align",
                    e.target.value as TextAlign
                  )
                }
              />

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Cor do fundo
              </label>

              <Input
                type="color"
                value={value.backgroundColor}
                onChange={(e) =>
                  update(
                    "backgroundColor",
                    e.target.value
                  )
                }
              />

            </div>

            <div>

              <label className="block text-sm text-gray-300 mb-2">
                Transparência ({value.backgroundOpacity}%)
              </label>

              <Input
                type="range"
                min={0}
                max={100}
                value={value.backgroundOpacity}
                onChange={(e) =>
                  update(
                    "backgroundOpacity",
                    Number(e.target.value)
                  )
                }
              />

            </div>

          </div>

        </>
      )}

      {showShadow && (

        <div className="space-y-5">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={value.shadow}
              onChange={(e) =>
                update("shadow", e.target.checked)
              }
            />

            <span className="text-gray-300">
              Adicionar sombra
            </span>

          </label>

          {value.shadow && (

            <div className="grid grid-cols-2 gap-5">

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Cor da sombra
                </label>

                <Input
                  type="color"
                  value={value.shadowColor}
                  onChange={(e) =>
                    update(
                      "shadowColor",
                      e.target.value
                    )
                  }
                />

              </div>

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Desfoque
                </label>

                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={value.shadowBlur}
                  onChange={(e) =>
                    update(
                      "shadowBlur",
                      Number(e.target.value)
                    )
                  }
                />

              </div>

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Deslocamento X
                </label>

                <Input
                  type="number"
                  min={-30}
                  max={30}
                  value={value.shadowX}
                  onChange={(e) =>
                    update(
                      "shadowX",
                      Number(e.target.value)
                    )
                  }
                />

              </div>

              <div>

                <label className="block text-sm text-gray-300 mb-2">
                  Deslocamento Y
                </label>

                <Input
                  type="number"
                  min={-30}
                  max={30}
                  value={value.shadowY}
                  onChange={(e) =>
                    update(
                      "shadowY",
                      Number(e.target.value)
                    )
                  }
                />

              </div>

            </div>

          )}

        </div>

      )}

    </section>
  );
}