import type { ComponentType } from "react";
import { LuCircle, LuSquare } from "react-icons/lu";
import { iconItemClassName } from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/control-toolbar/constants";
import type { ShapeType } from "@/sketch-detail/shapes/useShapes";

type ShapeNavigationProps = {
  disabled: boolean;
  onAddShape: (type: ShapeType) => void;
};

type ShapeItem = {
  key: string;
  type: ShapeType;
  label: string;
  Icon: ComponentType;
};

const shapeItems: ShapeItem[] = [
  { key: "rect", type: "rect", label: "四角形", Icon: LuSquare },
  { key: "circle", type: "circle", label: "円", Icon: LuCircle },
];

const ShapeNavigation = ({ disabled, onAddShape }: ShapeNavigationProps) => {
  return (
    <>
      {shapeItems.map(({ key, type, label, Icon }) => (
        <IconButton
          key={key}
          label={`${label}を追加`}
          side={TOOLTIP_SIDE}
          className={iconItemClassName}
          disabled={disabled}
          onClick={() => onAddShape(type)}
        >
          <Icon />
        </IconButton>
      ))}
    </>
  );
};

export { ShapeNavigation };
