import * as React from "react"

export interface ScrollAreaProps
  extends React.HTMLAttributes<HTMLDivElement> {
  hideScrollbar?: boolean
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, hideScrollbar = false, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div
        className={`h-full w-full overflow-auto ${
          hideScrollbar ? "scrollbar-hide" : ""
        }`}
        style={{
          scrollbarWidth: hideScrollbar ? "none" : "auto",
        }}
      >
        {props.children}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
)

ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
