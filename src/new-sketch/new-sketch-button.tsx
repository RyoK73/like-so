"use client";
import {
  useActionState,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "@/design-system/button";
import { toast } from "@/design-system/toast";
import { MyToolTip } from "@/design-system/tool-tip";
import { startNewSketch } from "@/new-sketch/start-new-sketch";

type NewSketchButtonProps = {
  className?: string;
  children?: ReactNode;
  tooltip?: Pick<ComponentProps<typeof MyToolTip>, "message" | "side">;
};

const NewSketchButton = ({
  className,
  children = "新規作成",
  tooltip,
}: NewSketchButtonProps) => {
  const [state, formAction, isPending] = useActionState(startNewSketch, null);

  useEffect(() => {
    if (state?.error) {
      toast.add({ type: "error", title: state.error });
    }
  }, [state]);

  const button = (
    <Button
      type="submit"
      className={className}
      disabled={isPending}
      aria-label="新規スケッチ作成"
    >
      {children}
    </Button>
  );

  return (
    <form action={formAction}>
      {tooltip ? <MyToolTip {...tooltip}>{button}</MyToolTip> : button}
    </form>
  );
};

export { NewSketchButton };
