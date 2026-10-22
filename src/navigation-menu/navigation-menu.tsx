import type { ComponentType } from "react";
import { getAuthState, type AuthState } from "@/supabase/auth/getAuthState";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { SketchListLink } from "@/navigation-menu/sketch-list-link";
import { NewSketchIconButton } from "@/navigation-menu/new-sketch-icon-button";
import { ThemeToggleButton } from "@/navigation-menu/theme-toggle-button";
import { SignOutButton } from "@/navigation-menu/sign-out/sign-out-button";
import { SignUpLink } from "@/navigation-menu/sign-up-link";
import { SignInLink } from "@/navigation-menu/sign-in-link";

const iconItemClassName =
  "inline-flex size-10 items-center justify-center rounded-xl bg-transparent text-foreground hover:bg-accent [&_svg:not([class*='size-'])]:size-5";

type MenuItem = {
  key: string;
  Item: ComponentType<{ className?: string }>;
  visibleFor: Exclude<AuthState, "signedOut">[];
};

const menuItems: MenuItem[] = [
  {
    key: "sketch-list",
    Item: SketchListLink,
    visibleFor: ["guest", "registered"],
  },
  {
    key: "new-sketch",
    Item: NewSketchIconButton,
    visibleFor: ["guest", "registered"],
  },
  {
    key: "theme-toggle",
    Item: ThemeToggleButton,
    visibleFor: ["guest", "registered"],
  },
  { key: "sign-up", Item: SignUpLink, visibleFor: ["guest"] },
  { key: "sign-in", Item: SignInLink, visibleFor: ["guest"] },
  { key: "sign-out", Item: SignOutButton, visibleFor: ["registered"] },
];

const NavigationMenu = async () => {
  const serverClient = await createSupabaseServerClient();
  const userState = await getAuthState(serverClient);

  if (userState === "signedOut") return null;

  return (
    <nav
      aria-label="ナビゲーションメニュー"
      className="sticky top-0 z-10 flex h-screen shrink-0 items-center pl-4"
    >
      <ul className="flex flex-col gap-2 bg-card p-2 border-2 border-foreground/60 shadow-float brush-a rotate-0">
        {menuItems
          .filter(({ visibleFor }) => visibleFor.includes(userState))
          .map(({ key, Item }) => (
            <li key={key}>
              <Item className={iconItemClassName} />
            </li>
          ))}
      </ul>
    </nav>
  );
};

export { NavigationMenu };
