import { useTranslation } from "react-i18next";

export default function CreateGyePage() {
  const { t: tGye } = useTranslation("gye");

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold text-content-primary mb-4">
        {tGye("create")}
      </h1>
      <p className="text-content-secondary">
        계모임 생성 폼이 여기에 표시됩니다.
      </p>
    </div>
  );
}
