"use client";
import {
  useActionState,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react";
import { toast } from "@/design-system/toast";
import { Button } from "@/design-system/button";
import { MyToolTip } from "@/design-system/tool-tip";
import { startNewSketch } from "@/new-sketch/start-new-sketch";

type NewSketchButtonProps = {
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
  tooltip?: Pick<ComponentProps<typeof MyToolTip>, "message" | "side">;
  variant?: ComponentProps<typeof Button>["variant"];
};

const NewSketchButton = ({
  className,
  children = "新規作成",
  tooltip,
  ariaLabel,
  variant,
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
      aria-label={ariaLabel}
      variant={variant}
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
