import { ErrorLinkButton, ErrorPageLayout } from "@/error-pages";

const NotFound = () => {
  return (
    <ErrorPageLayout
      title="ページが見つかりません"
      description="URLが間違っているか、ページが移動した可能性があります"
      actions={<ErrorLinkButton href="/">トップへ戻る</ErrorLinkButton>}
    />
  );
};

export default NotFound;
