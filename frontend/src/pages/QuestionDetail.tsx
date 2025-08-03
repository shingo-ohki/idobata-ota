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
                        {(() => {
                          const debateData = isMockMode
                            ? {
                                axes: [
                                  {
                                    title: "支援の方向性",
                                    options: [
                                      {
                                        label: "個人の能力開発支援",
                                        description: "個人のスキルアップや能力開発を支援する政策を重視",
                                      },
                                      {
                                        label: "雇用環境の整備",
                                        description: "企業側の採用・雇用制度を改革する政策を重視",
                                      },
                                    ],
                                  },
                                  {
                                    title: "支援の対象",
                                    options: [
                                      {
                                        label: "新卒・若年層全般",
                                        description: "新卒者を含む若年層全体を対象とした支援策",
                                      },
                                      {
                                        label: "特定のニーズを持つ若者",
                                        description: "困難を抱える若者や特定のニーズを持つ若者に焦点",
                                      },
                                    ],
                                  },
                                ],
                                agreementPoints: [
                                  "現状の新卒一括採用に問題がある点",
                                  "キャリア教育の強化が必要な点",
                                  "若者のキャリア形成に関する不安が大きい点",
                                ],
                                disagreementPoints: [
                                  "国の介入度合い（市場主導 vs 政府主導）",
                                  "支援の優先順位（教育改革 vs 雇用制度改革）",
                                  "地方と都市部の格差への対応策",
                                ],
                              }
                            : questionDetail?.debateData;

                          if (!debateData) {
                            return (
                              <div className="text-gray-500 text-center py-8">
                                論点データを読み込み中...
                              </div>
                            );
                          }

                          return (
                            <>
                              {/* 対立軸の表示 */}
                              {debateData.axes?.map((axis) => (
                                <div key={axis.title}>
                                  <h5 className="text-xl font-bold text-gray-800 mb-2">{axis.title}</h5>
                                  <div className="pl-6 space-y-4">
                                    {axis.options?.map((option) => (
                                      <div key={option.label}>
                                        <h6 className="font-bold text-gray-800 mb-1">{option.label}</h6>
                                        <p className="text-gray-800 leading-8">{option.description}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              {/* 合意点の表示 */}
                              {debateData.agreementPoints && debateData.agreementPoints.length > 0 && (
                                <div>
                                  <h5 className="text-xl font-bold text-gray-800 mb-2">合意点</h5>
                                  <div className="pl-6 space-y-2">
                                    {debateData.agreementPoints.map((point) => (
                                      <p key={point} className="text-gray-800 leading-8">• {point}</p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 対立点の表示 */}
                              {debateData.disagreementPoints && debateData.disagreementPoints.length > 0 && (
                                <div>
                                  <h5 className="text-xl font-bold text-gray-800 mb-2">対立点</h5>
                                  <div className="pl-6 space-y-2">
                                    {debateData.disagreementPoints.map((point) => (
                                      <p key={point} className="text-gray-800 leading-8">• {point}</p>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
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
                    {(() => {
                      const reportExample = isMockMode
                        ? {
                            introduction:
                              "若者の雇用とキャリア形成に関する市民の意見を集約した結果、以下のような課題が浮かび上がりました。これらの課題に対して、政策立案者は具体的な対応を検討すべきです。",
                            issues: [
                              {
                                title: "1. 新卒一括採用システムの見直し",
                                description:
                                  "現行の新卒一括採用システムは若者のキャリア選択の幅を狭め、多様な才能や適性を活かしにくくしています。通年採用や複数回採用の導入、中途採用の強化などの改革が求められています。",
                              },
                              {
                                title: "2. 実践的なキャリア教育の充実",
                                description:
                                  "学校教育と実社会のギャップを埋めるため、早期からの職業体験やインターンシップ、社会人メンターとの交流など、実践的なキャリア教育の充実が必要です。",
                              },
                              {
                                title: "3. 若者の非正規雇用問題への対応",
                                description:
                                  "若者の非正規雇用の増加は将来の不安定さにつながります。正規雇用への転換支援や、非正規でも安定したキャリア形成が可能な制度設計が求められています。",
                              },
                            ],
                          }
                        : questionDetail?.reportExample ?? {
                            introduction:
                              "レポート例はまだ作成されていません。より多くの意見が集まるとレポート例が表示されるようになります。",
                            issues: [],
                          };

                      return (
                        <>
                          {/* 導入文 */}
                          <p className="text-gray-800 leading-8">
                            {reportExample.introduction}
                          </p>

                          {/* 課題一覧 */}
                          {reportExample.issues && reportExample.issues.length > 0 && (
                            <div className="space-y-6">
                              {reportExample.issues.map((issue) => (
                                <div key={issue.title}>
                                  <h5 className="text-xl font-bold text-gray-800 mb-3">{issue.title}</h5>
                                  <p className="text-gray-800 leading-8">
                                    {issue.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()}
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
                  {(() => {
                    const visualReport = questionDetail?.visualReport;

                    // デバッグ情報をコンソールに出力
                    console.log('Debug - isMockMode:', isMockMode);
                    console.log('Debug - questionDetail:', questionDetail);
                    console.log('Debug - visualReport:', visualReport);

                    // HTMLコンテンツかどうかをチェック
                    if (visualReport && typeof visualReport === 'string') {
                      // HTMLコンテンツの場合
                      if (visualReport.includes('<!DOCTYPE html>') || visualReport.includes('<html')) {
                        return (
                          <div className="w-full h-full">
                            <iframe
                              srcDoc={visualReport}
                              className="w-full h-full border-0 rounded-2xl"
                              title="イラスト要約"
                              sandbox="allow-same-origin"
                            />
                          </div>
                        );
                      }
                      // 画像URLの場合
                      return (
                        <img
                          src={visualReport}
                          alt="イラスト要約"
                          className="max-w-full max-h-full object-contain rounded-2xl"
                        />
                      );
                    }

                    // 画像がない場合のプレースホルダー
                    return (
                      <div className="w-64 md:w-96 h-[300px] md:h-[500px] bg-gray-300 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-gray-600 text-sm md:text-lg block mb-2">
                            {questionDetail === null
                              ? "イラスト画像を読み込み中..."
                              : visualReport === null
                                ? "イラスト画像はまだ生成されていません"
                                : "イラスト画像はまだ生成されていません"
                            }
                          </span>
                          <span className="text-gray-500 text-xs block">
                            デバッグ: isMockMode={String(isMockMode)}, visualReport={String(visualReport)}
                          </span>
                          {questionDetail && visualReport === null && (
                            <span className="text-gray-500 text-xs block mt-1">
                              より多くの意見が集まるとイラスト要約が生成されます
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
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
