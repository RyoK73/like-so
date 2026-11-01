import Link from "next/link";

const SketchError = ({ message }: { message: string }) => {
  return (
    <div className="flex h-dvh flex-col items-center justify-center gap-2">
      <p role="alert">{message}</p>
      <Link href="/sketches" className="underline">
        スケッチ一覧へ戻る
      </Link>
    </div>
  );
};

export { SketchError };
