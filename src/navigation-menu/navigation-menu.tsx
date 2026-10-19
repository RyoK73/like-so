import { getAuthState } from "@/supabase/auth/getAuthState";
import { createSupabaseServerClient } from "@/supabase/utils/serverClient";
import { SketchListLink } from "@/navigation-menu/sketch-list-link";
import { NewSketchIconButton } from "@/navigation-menu/new-sketch-icon-button";
import { ThemeToggleButton } from "@/navigation-menu/theme-toggle-button";
import { SignOutButton } from "@/navigation-menu/sign-out-button";
import { SignUpLink } from "@/navigation-menu/sign-up-link";

const menuItems = [
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
  { key: "sign-out", Item: SignOutButton, visibleFor: ["guest", "registered"] },
  { key: "sign-up", Item: SignUpLink, visibleFor: ["guest"] },
];

const NavigationMenu = async () => {
  const serverClient = await createSupabaseServerClient();
  const userState = await getAuthState(serverClient);

  if (userState === "signedOut") return null;

  return (
    <nav aria-label="ナビゲーションメニュー">
      <ul>
        {menuItems
          .filter(({ visibleFor }) => visibleFor.includes(userState))
          .map(({ key, Item }) => (
            <li key={key}>
              <Item />
            </li>
          ))}
      </ul>
    </nav>
  );
};

export { NavigationMenu };
