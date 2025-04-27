import React from "react";

interface TableLoadingMaskProps {
  isLoading: boolean;
}

export const TableLoadingMask: React.FC<TableLoadingMaskProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
      <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-lg shadow-md">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"
          role="status"
        >
          <span className="sr-only">Loading...</span>
        </div>
        <span className="text-sm font-medium text-gray-700">Loading trades...</span>
      </div>
    </div>
  );
};
