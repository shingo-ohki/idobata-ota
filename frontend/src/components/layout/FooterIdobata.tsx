import { Button } from "../ui/button";
import { ArrowUpRight } from "lucide-react";

const FooterIdobata = () => {
  return (
    <div className="w-full relative">
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#94B9F9] to-[#9CE0E5]" />
      {/* 白い半透明オーバーレイ */}
      <div className="absolute inset-0 bg-white/50" />
      {/* コンテンツ */}
      <div className="relative">
        {/* SP版レイアウト */}
        <div className="block md:hidden px-6 py-6">
          <div className="w-full bg-white rounded-3xl p-8">
            {/* ロゴとタイトルエリア */}
            <div className="flex flex-col items-center gap-8 mb-8">
              <div className="flex items-center justify-center gap-3">
                {/* ロゴエリア */}
                <img
                  src="/images/idobata-logo.svg"
                  alt="いどばたビジョン"
                  className="w-[68px] h-[68px] object-contain"
                />
                {/* タイトル */}
                <h2 className="text-[32px] font-bold leading-[1.28] tracking-[0.03281em] text-[#94B9F9] whitespace-pre-line">
                  {"いどばた\nビジョン"}
                </h2>
              </div>
            </div>

            {/* 情報エリア */}
            <div className="flex flex-col gap-4">
              {/* テキスト */}
              <p className="text-xs leading-[2em] tracking-[0.025em] text-zinc-800 text-justify">
                いどばたビジョンは、デジタル民主主義2030プロジェクトから生まれたオープンソース（OSS）アプリケーションです。本ページは、そのOSS成果物を活用して構築されています。
              </p>

              {/* ボタンエリア */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-5 rounded-full border-[#27272A] text-xs font-bold leading-8 tracking-[0.025em] text-[#27272A] bg-white hover:bg-gray-50"
                >
                  いどばたについて
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-5 rounded-full border-[#27272A] text-xs font-bold leading-8 tracking-[0.025em] text-[#27272A] bg-white hover:bg-gray-50"
                >
                  謝辞
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* PC版レイアウト */}
        <div className="hidden md:block py-10">
          <div className="w-full bg-white rounded-[32px] p-8">
            <div className="flex items-center gap-8">
              {/* ロゴとタイトルエリア */}
              <div className="flex items-center justify-center gap-3 w-64">
                {/* ロゴエリア */}
                <img
                  src="/images/idobata-logo.svg"
                  alt="いどばたビジョン"
                  className="w-[68px] h-[68px] object-contain"
                />
                {/* タイトル */}
                <h2 className="text-[32px] font-bold leading-[1.28] tracking-[0.03281em] text-[#94B9F9] whitespace-pre-line">
                  {"いどばた\nビジョン"}
                </h2>
              </div>

              {/* 情報エリア */}
              <div className="flex-1 flex flex-col justify-center gap-4">
                {/* テキスト */}
                <p className="text-xs leading-[2em] tracking-[0.025em] text-zinc-800 text-justify">
                  いどばたビジョンは、デジタル民主主義2030プロジェクトから生まれたオープンソース（OSS）アプリケーションです。
                  <br />
                  本ページは、そのOSS成果物を活用して構築されています。
                </p>

                {/* ボタンエリア */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-5 rounded-full border-[#27272A] text-xs font-bold leading-8 tracking-[0.025em] text-[#27272A] bg-white hover:bg-gray-50"
                  >
                    いどばたについて
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-5 rounded-full border-[#27272A] text-xs font-bold leading-8 tracking-[0.025em] text-[#27272A] bg-white hover:bg-gray-50"
                  >
                    謝辞
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterIdobata;
