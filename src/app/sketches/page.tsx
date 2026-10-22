import { SketchList } from "@/sketch-list";

const page = () => {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12 pl-20">
      <h1 className="text-2xl font-semibold tracking-tight">スケッチ</h1>
      <SketchList />
    </div>
  );
};

export default page;
