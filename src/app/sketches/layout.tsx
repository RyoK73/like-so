import { NavigationMenu } from "@/navigation-menu";

export default function SketchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <NavigationMenu />
      {children}
    </div>
  );
}
