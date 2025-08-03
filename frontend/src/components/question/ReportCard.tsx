import { Plus } from "lucide-react";
import { ReactNode } from "react";
import { DownloadButton } from "../ui";

interface ReportCardProps {
  title: string;
  downloadButtonText: string;
  children: ReactNode;
  className?: string;
}

const ReportCard = ({ title, downloadButtonText, children, className = "" }: ReportCardProps) => {
  return (
    <div className={`bg-gray-100 rounded-xl p-4 md:p-6 mb-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h3>
        <DownloadButton>
          {downloadButtonText}
        </DownloadButton>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-8 relative">
        <div className="h-[200px] md:h-[280px] overflow-hidden">
          {children}
        </div>

        {/* グラデーションオーバーレイ */}
        <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-t from-white to-transparent pointer-events-none" />

        {/* すべて読むボタン */}
        <div className="flex justify-center items-center gap-1 mt-4">
          <Plus className="w-4 h-4 text-blue-500" />
          <span className="text-blue-500 font-bold">すべて読む</span>
        </div>
      </div>
    </div>
  );
};

export default ReportCard;
