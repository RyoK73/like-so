"use client";
import { useActionState } from "react";
import { signOutAction } from "@/navigation-menu/sign-out/signOutAction";
import { LuLogOut } from "react-icons/lu";
import { MyToolTip } from "@/design-system/tool-tip";
import { toast } from "@/design-system/toast";
import { useEffect } from "react";

type SignOutState = { error: string } | undefined;

const SignOutButton = ({ className }: { className?: string }) => {
  const [state, formAction, isPending] = useActionState(
    signOutAction,
    undefined,
  );
  useEffect(() => {
    if (state?.error) toast.add({ type: "error", title: state?.error });
  }, [state?.error]);

  return (
    <MyToolTip message="サインアウト" side="right">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          aria-label="サインアウト"
          className={className}
        >
          <LuLogOut />
        </button>
      </form>
    </MyToolTip>
  );
};

export { SignOutButton, type SignOutState };
