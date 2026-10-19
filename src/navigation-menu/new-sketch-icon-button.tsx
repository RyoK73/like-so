import { NewSketchButton } from "@/new-sketch";
import { LuSquarePlus } from "react-icons/lu";

const NewSketchIconButton = () => {
  return (
    <NewSketchButton tooltip={{ message: "新規スケッチ作成", side: "right" }}>
      <LuSquarePlus />
    </NewSketchButton>
  );
};

export { NewSketchIconButton };
