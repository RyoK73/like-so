"use client";
import {
  useActionState,
  useEffect,
  type ComponentProps,
  type ReactNode,
} from "react";
import type { Side } from "@base-ui/react/internals/useAnchorPositioning";
import { toast } from "@/design-system/toast";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { startNewSketch } from "@/new-sketch/start-new-sketch";

type CommonProps = {
  ariaLabel: string;
  className?: string;
  children?: ReactNode;
};

type VariantProps =
  | {
      variant: "icon";
      tooltipSide: Side;
    }
  | {
      variant?: Exclude<ComponentProps<typeof Button>["variant"], "icon">;
      tooltipSide?: never;
    };

type NewSketchButtonProps = CommonProps & VariantProps;

const NewSketchButton = ({
  className,
  children = "新規作成",
  ariaLabel,
  ...variantProps
}: NewSketchButtonProps) => {
  const [state, formAction, isPending] = useActionState(startNewSketch, null);

  useEffect(() => {
    if (state?.error) {
      toast.add({ type: "error", title: state.error });
    }
  }, [state]);

  return (
    <form action={formAction}>
      {variantProps.variant === "icon" ? (
        <IconButton
          type="submit"
          className={className}
          disabled={isPending}
          label={ariaLabel}
          side={variantProps.tooltipSide}
        >
          {children}
        </IconButton>
      ) : (
        <Button
          type="submit"
          className={className}
          disabled={isPending}
          aria-label={ariaLabel}
          variant={variantProps.variant}
        >
          {children}
        </Button>
      )}
    </form>
  );
};

export { NewSketchButton };
