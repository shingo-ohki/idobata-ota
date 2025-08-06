import { Bot, Loader2, Send } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useDraggable } from "../../../hooks/useDraggable";
import { Button } from "../../ui/button";
import {
  ChatSheet as BaseChatSheet,
  ChatSheetContent,
} from "../../ui/chat/chat-sheet";
import { ChatHeader as DesktopChatHeader } from "../desktop/ChatHeader";
import { ChatHeader as MobileChatHeader } from "../mobile/ChatHeader";
import { useChat } from "./ChatProvider";
import ExtendedChatHistory from "./ExtendedChatHistory";

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => void;
  isDesktop?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
}

export const ChatSheet: React.FC<ChatSheetProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isDesktop = false,
  disabled = false,
  disabledMessage = "このテーマではコメントが無効化されています",
}) => {
  const { messages, addMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { height, handleDragStart } = useDraggable({
    minHeight: 300,
    maxHeight: window.innerHeight * 0.8,
    initialHeight: 500,
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isSending && isOpen && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [isSending, isOpen, disabled]);

  const handleSendMessage = () => {
    if (inputValue.trim() && !isSending) {
      setIsSending(true);

      const message = inputValue;
      setInputValue("");

      if (onSendMessage) {
        try {
          onSendMessage(message);
          setTimeout(() => {
            setIsSending(false);
          }, 1000);
        } catch (error) {
          console.error("Error sending message:", error);
          setIsSending(false);
        }
      } else {
        addMessage(message, "user");
        setTimeout(() => {
          setIsSending(false);
        }, 1000);
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent & {
      isComposing?: boolean;
      nativeEvent: { isComposing?: boolean };
    }
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      !isSending &&
      !e.isComposing &&
      !e.nativeEvent.isComposing
    ) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderDisabledState = () => (
    <div className="p-4 bg-gray-100 text-gray-500 text-center border-t">
      <p>{disabledMessage}</p>
    </div>
  );

  // For desktop view, we don't use the sheet component
  if (isDesktop) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-blue-100">
        {/* AI Chat Header */}
        <div className="flex items-center gap-2 p-3 bg-white">
          <div className="w-8 h-8 bg-white rounded-lg border border-blue-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">AIチャット対話</h2>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-grow overflow-auto px-3 py-2 space-y-2">
          <ExtendedChatHistory messages={messages} />
        </div>
        
        {/* Input Area */}
        {disabled ? (
          renderDisabledState()
        ) : (
          <div className="p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="mb-4 flex gap-3 items-center">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ここに入力"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base resize-none h-12 text-gray-700 placeholder-gray-400"
                  disabled={isSending}
                  rows={1}
                  ref={inputRef}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center text-lg font-bold shadow-sm flex-shrink-0"
                  disabled={!inputValue.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "↑"
                  )}
                </Button>
              </div>
              <div className="flex gap-3 justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-5 py-2 text-sm h-9 font-medium"
                  onClick={() => onSendMessage?.("お題を変える")}
                >
                  お題を変える
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-5 py-2 text-sm h-9 font-medium"
                  onClick={() => onSendMessage?.("対話を終わる")}
                >
                  対話を終わる
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile view uses the sheet component
  return (
    <BaseChatSheet open={isOpen} onOpenChange={onClose}>
      <ChatSheetContent
        className="p-0 h-auto rounded-t-xl overflow-hidden bg-gradient-to-b from-blue-50 to-blue-100"
        style={{ height: `${height}px` }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          if (!disabled) inputRef.current?.focus();
        }}
      >
        {/* AI Chat Header */}
        <div className="flex items-center gap-2 p-3 bg-white">
          <div className="w-8 h-8 bg-white rounded-lg border border-blue-400 flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800">AIチャット対話</h2>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-grow overflow-auto px-3 py-2 space-y-2">
          <ExtendedChatHistory messages={messages} />
        </div>
        
        {/* Input Area */}
        {disabled ? (
          renderDisabledState()
        ) : (
          <div className="p-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
              <div className="mb-4 flex gap-3 items-center">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="ここに入力"
                  className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base resize-none h-12 text-gray-700 placeholder-gray-400"
                  disabled={isSending}
                  rows={1}
                  ref={inputRef}
                />
                <Button
                  onClick={handleSendMessage}
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-12 h-12 flex items-center justify-center text-lg font-bold shadow-sm flex-shrink-0"
                  disabled={!inputValue.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "↑"
                  )}
                </Button>
              </div>
              <div className="flex gap-3 justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-5 py-2 text-sm h-9 font-medium"
                  onClick={() => onSendMessage?.("お題を変える")}
                >
                  お題を変える
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full px-5 py-2 text-sm h-9 font-medium"
                  onClick={() => onSendMessage?.("対話を終わる")}
                >
                  対話を終わる
                </Button>
              </div>
            </div>
          </div>
        )}
      </ChatSheetContent>
    </BaseChatSheet>
  );
};
