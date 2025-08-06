import { Send } from "lucide-react";
import type React from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";

interface FloatingChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
  disabled?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onClick,
  hasUnread = false,
  disabled = false,
}) => {
  if (disabled) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-accentGradient rounded-full shadow-lg p-1 opacity-50">
          <div className="flex flex-grow items-center bg-white rounded-full justify-center">
            <div className="text-gray-500 text-center py-4">
              コメントが無効化されています
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4">
      <Button
        onClick={onClick}
        className={cn(
          "w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 px-6 text-base font-medium shadow-lg flex items-center justify-center gap-2",
          hasUnread && "animate-pulse"
        )}
      >
        <Send className="h-5 w-5" />
        AIと対話を開始する
        {hasUnread && (
          <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500" />
        )}
      </Button>
    </div>
  );
};
