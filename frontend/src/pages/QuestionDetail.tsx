import { BarChart3, Lightbulb, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { FloatingChat, type FloatingChatRef } from "../components/chat";
import BreadcrumbView from "../components/common/BreadcrumbView";
import OtherOpinionCard from "../components/question/OtherOpinionCard";
import ThemePromptSection from "../components/question/ThemePromptSection";
import { DownloadButton } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";
import { useMock } from "../contexts/MockContext";
import { useQuestionDetail } from "../hooks/useQuestionDetail";
import { useThemeDetail } from "../hooks/useThemeDetail";
import { QuestionChatManager } from "../services/chatManagers/QuestionChatManager";
import { MessageType } from "../types";

const QuestionDetail = () => {
  const { themeId, qId } = useParams<{ themeId: string; qId: string }>();
  const { isMockMode } = useMock();
  const { user } = useAuth();
  const chatRef = useRef<FloatingChatRef>(null);
  const [chatManager, setChatManager] = useState<QuestionChatManager | null>(
    null
  );

  const { questionDetail, isLoading, error } = isMockMode
    ? { questionDetail: null, isLoading: false, error: null }
    : useQuestionDetail(themeId || "", qId || "");

  const { themeDetail: themeInfo } = useThemeDetail(themeId || "");

  const isCommentDisabled = isMockMode
    ? false
    : themeInfo?.theme?.disableNewComment === true;

  useEffect(() => {
    if (
      themeId &&
      qId &&
      user?.id &&
      (isMockMode || questionDetail?.question?.questionText)
    ) {
      const questionText = isMockMode
        ? mockQuestionData.question
        : questionDetail?.question?.questionText || "";

      const manager = new QuestionChatManager({
        themeId,
        questionId: qId,
        questionText,
        userId: user.id,
        onNewMessage: (message) => {
          let messageType: MessageType = "system";
          if (message.constructor.name === "UserMessage") {
            messageType = "user";
          } else if (message.constructor.name === "SystemNotification") {
            messageType = "system-message";
          }
          chatRef.current?.addMessage(message.content, messageType);
        },
        onNewExtraction: (extraction) => {
          console.log("New extraction:", extraction);
        },
      });

      setChatManager(manager);

      return () => {
        manager.cleanup();
      };
    }
  }, [themeId, qId, isMockMode, questionDetail, user?.id]);

  const handleSendMessage = (message: string) => {
    if (chatManager) {
      chatManager.addMessage(message, "user");
    } else if (isMockMode) {
      console.log("Message sent:", message);

      setTimeout(() => {
        chatRef.current?.addMessage("メッセージを受け取りました。", "system");
      }, 500);
    }
  };

  const mockQuestionData = {
    id: qId,
    question: "どうすれば若者が安心してキャリアを築ける社会を実現できるか？",
    tagLine: "若者のキャリア構築支援",
    tags: ["キャリア", "若者", "支援"],
    voteCount: 42,
  };

  const mockThemeData = {
    id: themeId,
    title: "若者の雇用とキャリア支援",
  };


  const mockOpinions = {
    issues: [
      {
        id: 1,
        text: "新卒一括採用の仕組みが、若者のキャリア選択の幅を狭めている",
        relevance: 95,
      },
      {
        id: 2,
        text: "大学教育と実社会で求められるスキルにギャップがある",
        relevance: 87,
      },
      {
        id: 3,
        text: "若者の非正規雇用が増加し、将来設計が立てにくい",
        relevance: 82,
      },
      {
        id: 4,
        text: "キャリア教育が不十分で、自分に合った仕事を見つけられない若者が多い",
        relevance: 78,
      },
      {
        id: 5,
        text: "地方の若者は都市部に比べて就職機会が限られている",
        relevance: 75,
      },
    ],
    solutions: [
      {
        id: 1,
        text: "インターンシップ制度の拡充と単位認定の推進",
        relevance: 92,
      },
      {
        id: 2,
        text: "職業体験プログラムを中高生から段階的に導入する",
        relevance: 88,
      },
      {
        id: 3,
        text: "若者向けのキャリアカウンセリングサービスの無料提供",
        relevance: 84,
      },
      {
        id: 4,
        text: "リモートワークの推進による地方在住若者の就業機会拡大",
        relevance: 79,
      },
      {
        id: 5,
        text: "若者の起業支援と失敗しても再チャレンジできる制度の整備",
        relevance: 76,
      },
    ],
  };


  if (!isMockMode && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p>質問の詳細を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isMockMode && error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isMockMode || questionDetail) {
    const questionData = isMockMode
      ? mockQuestionData
      : {
          id: questionDetail?.question?._id ?? "",
          question: questionDetail?.question?.questionText ?? "",
          tagLine: questionDetail?.question?.tagLine ?? "",
          tags: questionDetail?.question?.tags ?? [],
          voteCount: questionDetail?.question?.voteCount ?? 0,
        };

    const themeData = isMockMode
      ? mockThemeData
      : {
          id: themeId || "",
          title: "テーマ", // APIからテーマ情報を取得する必要があるかも
        };

    const opinions = isMockMode
      ? mockOpinions
      : {
          issues:
            questionDetail?.relatedProblems?.map((p) => ({
              id: p._id,
              text: p.statement,
              relevance: Math.round(p.relevanceScore * 100) || 0,
            })) ?? [],
          solutions:
            questionDetail?.relatedSolutions?.map((s) => ({
              id: s._id,
              text: s.statement,
              relevance: Math.round(s.relevanceScore * 100) || 0,
            })) ?? [],
        };

    const breadcrumbItems = [
      { label: "テーマ一覧", href: "/themes" },
      { label: themeData.title, href: `/themes/${themeId}` },
      {
        label: questionData.tagLine || questionData.question,
        href: `/themes/${themeId}/questions/${qId}`,
      },
    ];

    return (
      <>
        <div className="md:mr-[50%]">
          <div className="hidden md:block container mx-auto px-4">
            <BreadcrumbView items={breadcrumbItems} />
          </div>
          <div className="container mx-auto px-4 py-8">
            <ThemePromptSection
              themeTitle={themeData.title}
              themeDescription={questionData.question}
              themeTags={questionData.tags}
              participantCount={
                isMockMode ? 99 : questionDetail?.participantCount || 0
              }
              dialogueCount={
                isMockMode ? 170 : questionDetail?.dialogueCount || 0
              }
            />
          </div>

          {/* ほかの人の意見セクション */}
          <div className="mb-8 px-6">
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-8 h-8 text-orange-400 stroke-2" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
                    ほかの人の意見
                  </h2>
                </div>
                <div className="flex justify-end md:justify-start items-center gap-4 flex-wrap">
                  <div className="flex items-center justify-center gap-1 px-0 py-0">
                    <span className="text-xs text-red-500 font-normal leading-8 tracking-wide">課題</span>
                    <span className="text-xl font-bold text-gray-800 leading-8 tracking-wide">{opinions.issues.length}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 px-0 py-0">
                    <span className="text-xs text-green-500 font-normal leading-8 tracking-wide">対策</span>
                    <span className="text-xl font-bold text-gray-800 leading-8 tracking-wide">{opinions.solutions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-xl p-3 relative">
              <div className="flex flex-col md:flex-row md:flex-wrap gap-4 pt-3">
                {(() => {
                  // 課題と対策を統合して新しい順に並べる
                  const allOpinions = [
                    ...opinions.issues.map((issue, index) => ({
                      id: issue.id,
                      text: issue.text,
                      type: "課題" as const,
                      relevance: issue.relevance,
                      userName: `ユーザー${index + 1}`,
                      userIconColor: ["red", "blue", "yellow", "green"][index % 4] as "red" | "blue" | "yellow" | "green"
                    })),
                    ...opinions.solutions.map((solution, index) => ({
                      id: solution.id,
                      text: solution.text,
                      type: "対策" as const,
                      relevance: solution.relevance,
                      userName: `ユーザー${index + opinions.issues.length + 1}`,
                      userIconColor: ["red", "blue", "yellow", "green"][(index + opinions.issues.length) % 4] as "red" | "blue" | "yellow" | "green"
                    }))
                  ];

                  // 関連度の高い順にソートして最初の4つを取得
                  const topOpinions = allOpinions
                    .sort((a, b) => b.relevance - a.relevance)
                    .slice(0, 4);

                  return topOpinions.map((opinion, index) => (
                    <OtherOpinionCard
                      key={opinion.id}
                      text={opinion.text}
                      userName={opinion.userName}
                      type={opinion.type}
                      userIconColor={opinion.userIconColor}
                    />
                  ));
                })()}
              </div>

              {/* グラデーションオーバーレイ */}
              <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />

              {/* スクロールバー */}
              <div className="absolute top-1 right-0 w-2.5 h-[106px] bg-black/16 rounded-full" />
            </div>
          </div>

          {/* 生成されたレポートセクション */}
          <div className="mb-8 px-6">
            {/* ヘッダー */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-blue-400 stroke-2" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
                    生成されたレポート
                  </h2>
                </div>
                <DownloadButton>
                  すべてダウンロード
                </DownloadButton>
              </div>
            </div>

            {/* 論点まとめカード */}
            <div className="bg-gray-100 rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">論点まとめ</h3>
                <DownloadButton>
                  PDFダウンロード
                </DownloadButton>
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-8 relative">
                <div className="h-[200px] md:h-[280px] overflow-hidden">
                  <div className="space-y-12">
                    {/* 主要な論点と対立軸 */}
                    <div>
                      <div className="border-b border-gray-300 pb-2 mb-4">
                        <h4 className="text-2xl font-bold text-gray-800">主要な論点と対立軸</h4>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h5 className="text-xl font-bold text-gray-800 mb-2">休息時間の確保と質向上のためのアプローチ</h5>
                          <div className="pl-6 space-y-4">
                            <div>
                              <h6 className="font-bold text-gray-800 mb-1">構造的改革</h6>
                              <p className="text-gray-800 leading-8">授業日程や時間割そのものを見直し、生徒の自由時間や休息時間を物理的に増やす（例：土曜授業の見直し、授業時間の短縮）。</p>
                            </div>
                            <div>
                              <h6 className="font-bold text-gray-800 mb-1">運用的改善</h6>
                              <p className="text-gray-800 leading-8">現行の授業枠組みの中で、昼寝時間の導入や休み時間の質の向上など、効果的なリフレッシュ手段を取り入れる。</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

            {/* 意見まとめカード */}
            <div className="bg-gray-100 rounded-xl p-4 md:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">意見まとめ</h3>
                <DownloadButton>
                  PDFダウンロード
                </DownloadButton>
              </div>

              <div className="bg-white rounded-2xl p-4 md:p-8 relative">
                <div className="h-[200px] md:h-[280px] overflow-hidden">
                  <div className="space-y-6">
                    <p className="text-gray-800 leading-8">
                      集約された意見によれば、生徒たちは過密な日程、特に土曜授業や長時間授業、短い休み時間に起因する慢性的な疲労に苦しんでいます。また、受験に直結しない科目や興味を持てない授業内容、物理的な学習環境（教室の場所など）も集中力低下の一因です。これらの問題に対し、休息時間の確保、授業内容・スケジュールの柔軟化、学習環境の改善が求められています。
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h5 className="text-xl font-bold text-gray-800 mb-3">土曜授業による慢性疲労と学習意欲低下</h5>
                        <p className="text-gray-800 leading-8">
                          生徒が土曜日の毎週の登校に精神的負担を感じ、週末の休息不足から慢性疲労が蓄積しています。これは学習意欲や学校生活満足度の低下を招く可能性があります。対策として、授業スケジュールの見直しや、十分な休息を確保できるよう、例えば昼寝時間の導入や土曜日の活動内容の変更などが検討されます。
                        </p>
                      </div>
                    </div>
                  </div>
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

            {/* イラスト要約カード */}
            <div className="bg-gray-100 rounded-xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800">イラスト要約</h3>
                <DownloadButton>
                  画像ダウンロード
                </DownloadButton>
              </div>

              <div className="bg-blue-50 border-4 border-white rounded-2xl py-4 md:py-8 relative">
                <div className="h-[200px] md:h-[280px] overflow-hidden flex justify-center items-center">
                  {/* プレースホルダー画像 */}
                  <div className="w-64 md:w-96 h-[300px] md:h-[500px] bg-gray-300 rounded-2xl flex items-center justify-center">
                    <span className="text-gray-600 text-sm md:text-lg">イラスト画像</span>
                  </div>
                </div>

                {/* グラデーションオーバーレイ */}
                <div className="absolute bottom-0 left-0 w-full h-[100px] bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />

                {/* すべて読むボタン */}
                <div className="flex justify-center items-center gap-1 mt-4">
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-500 font-bold">すべて読む</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FloatingChat
          ref={chatRef}
          onSendMessage={handleSendMessage}
          disabled={isCommentDisabled}
        />
      </>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center py-8">
        <p>質問の詳細を表示できません。</p>
      </div>
    </div>
  );
};

export default QuestionDetail;
