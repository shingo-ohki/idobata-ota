import { Button } from "../ui/button";
import { ExternalLink, Github, MessageCircle, Slack, Twitter } from "lucide-react";

const FooterDd2030 = () => {
  return (
    <div className="w-full bg-[#F1F6F8] px-6 py-6 md:py-10">
      <div className="w-full bg-white rounded-3xl md:rounded-[32px] p-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          {/* ロゴエリア */}
          <div className="flex justify-center md:justify-start mb-8 md:mb-0 md:flex-shrink-0">
            <div className="w-[170px] h-[81px] relative">
              {/* ロゴマーク部分 */}
              <div className="absolute left-0 top-0">
                <img
                  src="/images/dd2030-logomark.svg"
                  alt="デジタル民主主義2030 ロゴマーク"
                  className="w-[75px] h-[81px]"
                />
              </div>
              {/* ロゴタイプ部分 */}
              <div className="absolute left-[86.68px] top-[3.68px]">
                <img
                  src="/images/dd2030-logotype.svg"
                  alt="デジタル民主主義2030"
                  className="w-[84px] h-[74px]"
                />
              </div>
            </div>
          </div>

          {/* 情報エリア */}
          <div className="flex-1 space-y-4">
            {/* 説明テキスト */}
            <p className="text-[#27272A] text-xs leading-[2em] tracking-[0.025em] text-justify md:text-left">
              2030年には、情報技術により民主主義のあり方はアップデートされており、一人ひとりの声が政治・行政に届き、適切に合意形成・政策反映されていくような社会が当たり前になる、──そんな未来を目指して立ち上げられたのがデジタル民主主義2030プロジェクトです。
            </p>

            {/* ボタンエリア */}
            <div className="flex flex-wrap gap-3">
              {/* プロジェクトサイトボタン */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-5 rounded-full border-[#27272A] bg-white hover:bg-gray-50 text-[#27272A] text-xs font-bold tracking-[0.025em]"
                asChild
              >
                <a
                  href="https://digital-democracy-2030.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  プロジェクトサイト
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>

              {/* Twitterボタン */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border-[#27272A] bg-white hover:bg-gray-50"
                asChild
              >
                <a
                  href="https://twitter.com/dd2030_jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <Twitter className="w-4 h-4 text-[#27272A]" />
                </a>
              </Button>

              {/* Discordボタン */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-full border-[#27272A] bg-white hover:bg-gray-50"
                asChild
              >
                <a
                  href="https://discord.gg/dd2030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 text-[#27272A]" />
                </a>
              </Button>

              {/* Slackボタン */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-5 rounded-full border-[#27272A] bg-white hover:bg-gray-50 text-[#27272A] text-xs font-bold tracking-[0.025em]"
                asChild
              >
                <a
                  href="https://dd2030.slack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Slack className="w-4 h-4" />
                  slack
                </a>
              </Button>

              {/* GitHubボタン */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-5 rounded-full border-[#27272A] bg-white hover:bg-gray-50 text-[#27272A] text-xs font-bold tracking-[0.025em]"
                asChild
              >
                <a
                  href="https://github.com/dd2030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterDd2030;
