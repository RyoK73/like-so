import type { ComponentType } from "react";
import { LuCircle, LuSquare } from "react-icons/lu";
import {
  iconItemClassName,
  iconItemListClassName,
} from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/shape-navigation/constants";

type ShapeKind = "rect" | "circle";

type ShapeNavigationProps = {
  disabled: boolean;
  onAddShape: (type: ShapeKind) => void;
};

type ShapeItem = {
  key: string;
  type: ShapeKind;
  label: string;
  Icon: ComponentType;
};

const shapeItems: ShapeItem[] = [
  { key: "rect", type: "rect", label: "四角形", Icon: LuSquare },
  { key: "circle", type: "circle", label: "円", Icon: LuCircle },
];

const ShapeNavigation = ({ disabled, onAddShape }: ShapeNavigationProps) => {
  return (
    <div
      role="toolbar"
      aria-label="図形の追加"
      className={iconItemListClassName}
    >
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
    </div>
  );
};

export { ShapeNavigation };
export type { ShapeKind };
