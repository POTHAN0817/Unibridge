import React from "react";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Loading data..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-9 h-9 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mb-3"></div>
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
};
