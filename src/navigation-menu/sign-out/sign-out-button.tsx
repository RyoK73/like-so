"use client";
import { useActionState } from "react";
import { signOutAction } from "@/navigation-menu/sign-out/signOutAction";
import { LuLogOut } from "react-icons/lu";
import { MyToolTip } from "@/design-system/tool-tip";
import { toast } from "@/design-system/toast";
import { Button } from "@/design-system/button";
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
    <MyToolTip message="サインアウト" side="right">
      <form action={formAction}>
        <Button
          type="submit"
          disabled={isPending}
          aria-label="サインアウト"
          className={className}
          variant="icon"
        >
          <LuLogOut />
        </Button>
      </form>
    </MyToolTip>
  );
};

export { SignOutButton };
