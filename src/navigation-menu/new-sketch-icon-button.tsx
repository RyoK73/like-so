import { NewSketchButton } from "@/new-sketch";
import { LuSquarePlus } from "react-icons/lu";

type NewSketchIconButtonProps = {
  className?: string;
};

const NewSketchIconButton = ({ className }: NewSketchIconButtonProps) => {
  return (
    <NewSketchButton
      className={className}
      tooltip={{ message: "新規スケッチ作成", side: "right" }}
      ariaLabel="新規スケッチ作成"
      variant="icon"
    >
      <LuSquarePlus />
    </NewSketchButton>
  );
};

export { NewSketchIconButton };
