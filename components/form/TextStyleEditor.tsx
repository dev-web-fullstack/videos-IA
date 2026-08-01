// components/form/TextStyleEditor.tsx
"use client";

import Input from "../ui/Input";
import Select from "../ui/Select";

import type {
  TextStyle,
  TextAlign,
  TextVerticalPosition,
} from "../../lib/textStyle";

interface Props {
  value: TextStyle;
  onChange: (style: TextStyle) => void;
  showStyle?: boolean;
  showShadow?: boolean;
}

const fontOptions = [
  { value: "Roboto-Regular", label: "Roboto" },
  { value: "OpenSans-Regular", label: "Open Sans" },
  { value: "Montserrat-Regular", label: "Montserrat" },
  { value: "Lato-Regular", label: "Lato" },
  { value: "Inter-Regular", label: "Inter" },
  { value: "Poppins-Regular", label: "Poppins" },
  { value: "Nunito-Regular", label: "Nunito" },
  { value: "Quicksand-Regular", label: "Quicksand" },
  { value: "Raleway-Regular", label: "Raleway" },
  { value: "Oswald-Regular", label: "Oswald" },
];

const alignOptions = [
  { value: "left", label: "Esquerda" },
  { value: "center", label: "Centro" },
  { value: "right", label: "Direita" },
  { value: "justify", label: "Justificado" },
];

const verticalPositionOptions = [
  { value: "top", label: "⬆️ Cima" },
  { value: "center", label: "⏺️ Centro" },
  { value: "bottom", label: "⬇️ Baixo" },
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
              <label htmlFor="font-family" className="block text-sm text-gray-300 mb-2">
                Fonte
              </label>
              <Select
                id="font-family"
                name="fontFamily"
                options={fontOptions}
                value={value.fontFamily}
                onChange={(e) =>
                  update("fontFamily", e.target.value)
                }
              />
            </div>

            <div>
              <label htmlFor="font-size" className="block text-sm text-gray-300 mb-2">
                Tamanho
              </label>
              <Input
                id="font-size"
                name="fontSize"
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">

            <div>
              <label htmlFor="text-color" className="block text-sm text-gray-300 mb-2">
                Cor
              </label>
              <Input
                id="text-color"
                name="textColor"
                type="color"
                value={value.color}
                onChange={(e) =>
                  update("color", e.target.value)
                }
              />
            </div>

            <div>
              <label htmlFor="border-color" className="block text-sm text-gray-300 mb-2">
                Contorno
              </label>
              <Input
                id="border-color"
                name="borderColor"
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
              <label htmlFor="border-width" className="block text-sm text-gray-300 mb-2">
                Espessura
              </label>
              <Input
                id="border-width"
                name="borderWidth"
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

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label htmlFor="text-align" className="block text-sm text-gray-300 mb-2">
                Alinhamento
              </label>
              <Select
                id="text-align"
                name="textAlign"
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

            <div>
              <label htmlFor="vertical-position" className="block text-sm text-gray-300 mb-2">
                Posição
              </label>
              <Select
                id="vertical-position"
                name="verticalPosition"
                options={verticalPositionOptions}
                value={value.verticalPosition}
                onChange={(e) =>
                  update(
                    "verticalPosition",
                    e.target.value as TextVerticalPosition
                  )
                }
              />
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div>
              <label htmlFor="bg-color" className="block text-sm text-gray-300 mb-2">
                Cor do fundo
              </label>
              <Input
                id="bg-color"
                name="bgColor"
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
              <label htmlFor="bg-opacity" className="block text-sm text-gray-300 mb-2">
                Transparência ({value.backgroundOpacity}%)
              </label>
              <Input
                id="bg-opacity"
                name="bgOpacity"
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
                <label htmlFor="shadow-color" className="block text-sm text-gray-300 mb-2">
                  Cor da sombra
                </label>
                <Input
                  id="shadow-color"
                  name="shadowColor"
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
                <label htmlFor="shadow-blur" className="block text-sm text-gray-300 mb-2">
                  Desfoque
                </label>
                <Input
                  id="shadow-blur"
                  name="shadowBlur"
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
                <label htmlFor="shadow-x" className="block text-sm text-gray-300 mb-2">
                  Deslocamento X
                </label>
                <Input
                  id="shadow-x"
                  name="shadowX"
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
                <label htmlFor="shadow-y" className="block text-sm text-gray-300 mb-2">
                  Deslocamento Y
                </label>
                <Input
                  id="shadow-y"
                  name="shadowY"
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