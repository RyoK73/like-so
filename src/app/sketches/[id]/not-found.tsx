import { ErrorLinkButton, ErrorPageLayout } from "@/error-pages";

const NotFound = () => {
  return (
    <ErrorPageLayout
      title="スケッチが見つかりません"
      description="既に削除された可能性があります。"
      actions={
        <ErrorLinkButton href="/sketches">スケッチ一覧へ戻る</ErrorLinkButton>
      }
    />
  );
};

export default NotFound;
