import type { ComponentType } from "react";
import { cn } from "cn";
import { LuCircle, LuSquare } from "react-icons/lu";
import {
  iconItemClassName,
  iconItemListClassName,
} from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/shape-navigation/constants";
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
    <div
      role="toolbar"
      aria-label="図形の追加"
      className={cn(
        iconItemListClassName,
        "absolute bottom-4 left-1/2 z-10 -translate-x-1/2",
      )}
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
