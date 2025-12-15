import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function GyeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t: tGye } = useTranslation("gye");

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold text-content-primary mb-4">
        {tGye("title")} #{id}
      </h1>
      <p className="text-content-secondary">
        계모임 상세 페이지가 여기에 표시됩니다.
      </p>
    </div>
  );
}
