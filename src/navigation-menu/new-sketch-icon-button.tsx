import { NewSketchButton } from "@/new-sketch";
import { LuSquarePlus } from "react-icons/lu";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";

type NewSketchIconButtonProps = {
  className?: string;
};

const NewSketchIconButton = ({ className }: NewSketchIconButtonProps) => {
  return (
    <NewSketchButton
      className={className}
      tooltipSide={TOOLTIP_SIDE}
      ariaLabel="新規スケッチ作成"
      variant="icon"
    >
      <LuSquarePlus />
    </NewSketchButton>
  );
};

export { NewSketchIconButton };
