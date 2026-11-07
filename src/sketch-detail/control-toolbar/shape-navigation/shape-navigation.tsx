import type { ComponentType } from "react";
import { LuCircle, LuRedo2, LuSquare, LuTrash2, LuUndo2 } from "react-icons/lu";
import { iconItemClassName } from "@/design-system/constants";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/sketch-detail/control-toolbar/constants";
import type { ShapeType } from "@/sketch-detail/shapes/useShapes";

type ShapeNavigationProps = {
  disabled: boolean;
  onAddShape: (type: ShapeType) => void;
  onDelete: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
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

const ShapeNavigation = ({
  disabled,
  onAddShape,
  onDelete,
  undo,
  redo,
  canUndo,
  canRedo,
}: ShapeNavigationProps) => {
  return (
    <div role="toolbar" aria-label="図形の操作">
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
      <IconButton
        label="元に戻す"
        side={TOOLTIP_SIDE}
        className={iconItemClassName}
        disabled={disabled || !canUndo}
        onClick={undo}
      >
        <LuUndo2 />
      </IconButton>
      <IconButton
        label="やり直し"
        side={TOOLTIP_SIDE}
        className={iconItemClassName}
        disabled={disabled || !canRedo}
        onClick={redo}
      >
        <LuRedo2 />
      </IconButton>
      <IconButton
        label="削除"
        tooltipHint="Deleteキー"
        side={TOOLTIP_SIDE}
        className={iconItemClassName}
        disabled={disabled}
        onClick={onDelete}
      >
        <LuTrash2 />
      </IconButton>
    </div>
  );
};

export { ShapeNavigation };
