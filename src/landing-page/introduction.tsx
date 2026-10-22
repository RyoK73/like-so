import type { ReactNode } from "react";

const Dab = ({ className }: { className: string }) => (
  <span
    aria-hidden
    className={`pointer-events-none absolute size-10 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] opacity-80 mix-blend-multiply dark:mix-blend-normal ${className}`}
  />
);

const Introduction = ({ children }: { children: ReactNode }) => {
  return (
    <section className="mx-auto flex w-full flex-col gap-16 px-6 py-16 md:grid md:h-[calc(var(--grid-size)*12)] md:w-[round(down,min(100%,896px),128px)] md:auto-rows-(--grid-size) md:grid-cols-14 md:gap-0 md:p-0">
      <div className="relative flex flex-col justify-center gap-4 brush-a bg-background p-5 text-left md:col-span-10 md:col-start-1 md:row-span-3 md:row-start-3">
        <Dab className="-top-3 -left-3 bg-paint-blue" />
        <Dab className="-right-2 -bottom-3 size-7 bg-paint-yellow" />
        <h1 className="text-4xl font-bold tracking-tight">
          <span>ひらめき</span>を、描いて、渡す
        </h1>
        <div className="max-w text-muted-foreground">
          <p>
            思いついたアイデアをその場でスケッチしてそのままLLMに渡せるキャンバス
          </p>
        </div>
      </div>

      {/* <div className="flex flex-col gap-4 border-2 p-5"> */}
      {/*   <h2 className="text-2xl font-semibold tracking-tight"> */}
      {/*     言葉のほかに、もうひとつの伝え方を */}
      {/*   </h2> */}
      {/*   <p className="leading-relaxed"> */}
      {/*     自然言語は、人とLLMをつなぐ心強い共通言語です。 */}
      {/*   </p> */}
      {/*   <p className="leading-relaxed"> */}
      {/*     そのうえで、イメージや感覚のような主観的なものには、絵のほうがまっすぐ届く場面があります。 */}
      {/*   </p> */}
      {/*   <p className="leading-relaxed"> */}
      {/*     「左にサイドバーがあって、その右にカードが並んでいて……」と書くかわりに、3秒でさっとスケッチする。 */}
      {/*     そのほうが速くて、イメージにも近づきます。 */}
      {/*   </p> */}
      {/*   <p> */}
      {/*     Like-soは、ひらめきから伝わるまでの時間を、限りなくゼロに近づけます。 */}
      {/*   </p> */}
      {/* </div> */}

      <div className="relative flex flex-col justify-center gap-4 brush-b bg-background p-5 text-left md:col-span-10 md:col-end-16 md:row-span-3 md:row-start-8">
        <Dab className="-top-2 -right-3 bg-paint-green" />
        <Dab className="-bottom-3 -left-2 size-8 bg-paint-red" />
        <h2 className="text-3xl font-semibold tracking-tight">
          <span>シンプル</span>で、
          <span>速い</span>。
        </h2>
        <p className="leading-relaxed">
          Like-soは、軽やかさと速さを最優先
          <br />
          ひらめいた瞬間に開いて、描いて、渡す。
          <br />
          その流れだけを、いつでも気持ちよく使えることを目指す
        </p>
      </div>

      {/* <div className="flex flex-col gap-6"> */}
      {/*   <h2 className="text-2xl font-semibold tracking-tight"> */}
      {/*     こんな場面で使えます */}
      {/*   </h2> */}
      {/*   <ul className="grid divide-y divide-border overflow-hidden rounded-xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0"> */}
      {/*     <li className="p-6"> */}
      {/*       <p className="font-medium">LLMへの指示に</p> */}
      {/*       <p className="mt-1 text-sm text-muted-foreground"> */}
      {/*         アプリの画面をさっとスケッチして、そのままLLMに渡せます。 */}
      {/*       </p> */}
      {/*     </li> */}
      {/*     <li className="p-6"> */}
      {/*       <p className="font-medium">資料や発表に</p> */}
      {/*       <p className="mt-1 text-sm text-muted-foreground"> */}
      {/*         描いたモックを画像にして、資料やプレゼンにすぐ載せられます。 */}
      {/*       </p> */}
      {/*     </li> */}
      {/*     <li className="p-6"> */}
      {/*       <p className="font-medium">イメージの共有に</p> */}
      {/*       <p className="mt-1 text-sm text-muted-foreground"> */}
      {/*         頭の中のイメージを、チームや友人にそのまま見せられます。 */}
      {/*       </p> */}
      {/*     </li> */}
      {/*   </ul> */}
      {/* </div> */}
      <div className="flex flex-col items-start gap-3 sm:flex-row md:col-span-14 md:col-start-1 md:row-start-18">
        {children}
      </div>
    </section>
  );
};

export { Introduction };
