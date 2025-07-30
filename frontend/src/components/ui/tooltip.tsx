import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

const Tooltip = ({
  children,
  content,
  placement = "top",
  className
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      const x = rect.left + rect.width / 2;
      let y = rect.top;

      if (placement === "top") {
        y = rect.top - 8;
      } else if (placement === "bottom") {
        y = rect.bottom + 8;
      }

      setPosition({ x, y });
    }
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (!isVisible) {
      updatePosition();
    }
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      if (isVisible) {
        updatePosition();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleScroll);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isVisible, placement]);

  return (
    <>
      <div
        ref={triggerRef}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Show tooltip"
        className={cn(
          "cursor-pointer transition-colors duration-200",
          isVisible
            ? "bg-black/[0.06] rounded-lg px-2 py-1"
            : "px-2 py-1",
          className
        )}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            transform: placement === "top" ? "translateX(-50%) translateY(-100%)" : "translateX(-50%)"
          }}
        >
          <div className="relative bg-zinc-700 text-white text-xs font-bold leading-[2em] tracking-[0.025em] px-3 py-2 rounded shadow-lg max-w-[230px]">
            {content}
            {/* Arrow */}
            <div
              className={cn(
                "absolute w-0 h-0 border-l-[6px] border-r-[6px] border-solid border-transparent left-1/2 transform -translate-x-1/2",
                placement === "top"
                  ? "border-t-[6px] border-t-zinc-700 top-full"
                  : "border-b-[6px] border-b-zinc-700 -top-[6px]"
              )}
            />
          </div>
        </div>
      )}
    </>
  );
};

export { Tooltip };
