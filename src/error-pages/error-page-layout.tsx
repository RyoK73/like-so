import type { ReactNode } from "react";

type ErrorPageLayoutProps = {
  title: string;
  description?: string;
  actions: ReactNode;
  illustration?: ReactNode;
};

const ErrorPageLayout = ({
  title,
  description,
  actions,
  illustration,
}: ErrorPageLayoutProps) => {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 text-foreground flex-col gap-5">
      <section className="flex w-full max-w-xl flex-col items-start gap-4 brush-a bg-card p-5 text-left">
        {illustration && <div>{illustration}</div>}
        <h1 className="text-headline-lg">{title}</h1>
        {description && (
          <p className="text-body-md text-muted-foreground">{description}</p>
        )}
      </section>
      <div className="flex flex-col gap-3 sm:flex-row self-center">
        {actions}
      </div>
    </main>
  );
};

export { ErrorPageLayout };
