"use client";
import { useActionState } from "react";
import { signOutAction } from "@/navigation-menu/sign-out/signOutAction";
import { LuLogOut } from "react-icons/lu";
import { toast } from "@/design-system/toast";
import { IconButton } from "@/design-system/icon-button";
import { TOOLTIP_SIDE } from "@/navigation-menu/constants";
import { useEffect } from "react";

const SignOutButton = ({ className }: { className?: string }) => {
  const [state, formAction, isPending] = useActionState(
    signOutAction,
    undefined,
  );
  useEffect(() => {
    if (state?.error) toast.add({ type: "error", title: state?.error });
  }, [state]);

  return (
    <form action={formAction}>
      <IconButton
        type="submit"
        disabled={isPending}
        label="サインアウト"
        side={TOOLTIP_SIDE}
        className={className}
      >
        <LuLogOut />
      </IconButton>
    </form>
  );
};

export { SignOutButton };
