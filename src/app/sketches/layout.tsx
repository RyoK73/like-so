import { NavigationMenu } from "@/navigation-menu";

export default function SketchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavigationMenu />
      {children}
    </>
  );
}
