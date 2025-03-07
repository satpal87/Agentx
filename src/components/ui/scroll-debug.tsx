import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug } from "lucide-react";

interface ScrollDebugProps {
  targetRef: React.RefObject<HTMLElement>;
  className?: string;
}

/**
 * ScrollDebug Component
 *
 * A debugging tool that displays scroll-related information about a target element
 */
export function ScrollDebug({ targetRef, className }: ScrollDebugProps) {
  const [scrollInfo, setScrollInfo] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
    offsetHeight: 0,
    scrollBottom: 0,
    isScrollable: false,
  });

  useEffect(() => {
    const updateScrollInfo = () => {
      if (!targetRef.current) return;

      const element = targetRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const offsetHeight = element.offsetHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      const isScrollable = scrollHeight > clientHeight;

      setScrollInfo({
        scrollTop,
        scrollHeight,
        clientHeight,
        offsetHeight,
        scrollBottom,
        isScrollable,
      });
    };

    // Initial update
    updateScrollInfo();

    // Add scroll event listener
    const element = targetRef.current;
    if (element) {
      element.addEventListener("scroll", updateScrollInfo);

      // Also update on resize
      window.addEventListener("resize", updateScrollInfo);

      // Set up an interval to check periodically (helps catch content changes)
      const intervalId = setInterval(updateScrollInfo, 1000);

      return () => {
        element.removeEventListener("scroll", updateScrollInfo);
        window.removeEventListener("resize", updateScrollInfo);
        clearInterval(intervalId);
      };
    }
  }, [targetRef]);

  return (
    <Card className={className}>
      <CardHeader className="py-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Bug className="mr-2 h-4 w-4" />
          Scroll Debug Info
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <div className="text-xs space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <div>Scroll Top:</div>
            <div className="font-mono">{scrollInfo.scrollTop}px</div>

            <div>Scroll Height:</div>
            <div className="font-mono">{scrollInfo.scrollHeight}px</div>

            <div>Client Height:</div>
            <div className="font-mono">{scrollInfo.clientHeight}px</div>

            <div>Offset Height:</div>
            <div className="font-mono">{scrollInfo.offsetHeight}px</div>

            <div>Scroll Bottom:</div>
            <div className="font-mono">{scrollInfo.scrollBottom}px</div>

            <div>Is Scrollable:</div>
            <div className="font-mono">
              {scrollInfo.isScrollable ? "Yes" : "No"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
