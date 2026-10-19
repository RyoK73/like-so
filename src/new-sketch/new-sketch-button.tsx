"use client";
import { useActionState, useEffect, type ReactNode } from "react";
import { Button } from "@/design-system/button";
import { toast } from "@/design-system/toast";
import { startNewSketch } from "@/new-sketch/start-new-sketch";

type NewSketchButtonProps = {
  className?: string;
  children?: ReactNode;
};

const NewSketchButton = ({
  className,
  children = "新規作成",
}: NewSketchButtonProps) => {
  const [state, formAction, isPending] = useActionState(startNewSketch, null);

  useEffect(() => {
    if (state?.error) {
      toast.add({ type: "error", title: state.error });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <Button
        type="submit"
        className={className}
        disabled={isPending}
        aria-label="新規スケッチ作成"
      >
        {children}
      </Button>
    </form>
  );
};

export { NewSketchButton };
