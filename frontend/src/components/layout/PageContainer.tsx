import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
  noPadding?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = "",
  maxWidth = "7xl",
  noPadding = false,
}) => {
  const maxWidthMap = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto w-full ${maxWidthMap[maxWidth]} ${
        noPadding ? "" : "px-4 sm:px-6 py-6"
      } ${className}`}
    >
      {children}
    </div>
  );
};
