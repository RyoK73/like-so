import { cn } from "cn";
import { floatingToolbarClassName } from "@/design-system/constants";
import { LocalTime } from "@/design-system/local-time";

type TitleToolbarProps = {
  title: string;
  description: string;
  width: number;
  height: number;
  updatedAt: string;
};

const TitleToolbar = ({
  title,
  description,
  width,
  height,
  updatedAt,
}: TitleToolbarProps) => {
  return (
    <div
      className={cn(
        floatingToolbarClassName,
        "flex max-w-md flex-col gap-1 px-4 py-3",
      )}
    >
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description.trim() !== "" && (
        <p className="line-clamp-2 text-muted-foreground">{description}</p>
      )}
      <p className="text-sm text-muted-foreground">
        {width} × {height}
      </p>
      <LocalTime updatedAt={updatedAt} />
    </div>
  );
};

export { TitleToolbar };
