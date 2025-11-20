import React, { useLayoutEffect, useRef, useCallback } from 'react';

interface TooltipProps {
  text: string;
  children?: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const positionTooltip = useCallback(() => {
    const tooltip = tooltipRef.current;
    const arrow = arrowRef.current;

    if (!tooltip || !arrow) return;

    // Reset styles for accurate measurement on each hover.
    tooltip.style.transform = '';
    arrow.style.left = '';
    arrow.style.right = '';

    const rect = tooltip.getBoundingClientRect();
    const isRTL = document.documentElement.dir === 'rtl';
    const PADDING = 16;
    let shiftX = 0;

    if (isRTL) {
      // Tooltip originates from the icon's right edge and expands leftwards.
      // We check if its left edge goes past the screen's padded boundary.
      if (rect.left < PADDING) {
        shiftX = PADDING - rect.left; // Positive value to shift it right.
      }
    } else { // LTR
      // Tooltip originates from the icon's left edge and expands rightwards.
      // We check if its right edge goes past the screen's padded boundary.
      if (rect.right > (window.innerWidth - PADDING)) {
        shiftX = (window.innerWidth - PADDING) - rect.right; // Negative value to shift it left.
      }
    }

    // Apply only the overflow-correcting translation to the tooltip bubble.
    tooltip.style.transform = `translateX(${shiftX}px)`;

    // The arrow is a child of the bubble and needs to stay aligned with the icon.
    // To counteract the bubble's shift, we apply an opposite position adjustment to the arrow.
    if (isRTL) {
      // Arrow's default is right-0. A positive shiftX moves the bubble right,
      // so we increase the arrow's 'right' to move it left, keeping it centered.
      arrow.style.right = `${shiftX}px`;
    } else { // LTR
      // Arrow's default is left-0. A negative shiftX moves the bubble left,
      // so we apply an opposite positive 'left' to the arrow to keep it centered.
      arrow.style.left = `${-shiftX}px`;
    }
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    // Position on hover to get the correct dimensions when the tooltip becomes visible
    if (container) {
      container.addEventListener('mouseenter', positionTooltip);
      return () => {
        container.removeEventListener('mouseenter', positionTooltip);
      };
    }
  }, [positionTooltip]);

  const triggerElement = children ? (
    <>{children}</>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 text-slate-500 dark:text-white/60 cursor-pointer"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div ref={containerRef} className="relative flex items-center group">
      {triggerElement}
      {/* Tooltip bubble - starts from the icon and expands inwards */}
      <div
        ref={tooltipRef}
        className="absolute bottom-full ltr:left-0 rtl:right-0 w-64 p-3 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm text-slate-800 dark:text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none text-start">
        {text}
        {/* Tooltip arrow - positioned to point at the icon's center */}
        <div
          ref={arrowRef}
          className="absolute ltr:left-0 rtl:right-0 top-full h-0 w-0 border-x-8 border-x-transparent border-t-[8px] border-t-white/95 dark:border-t-slate-800/95"></div>
      </div>
    </div>
  );
};
