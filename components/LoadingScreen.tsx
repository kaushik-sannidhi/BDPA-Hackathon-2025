"use client";

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingScreen({ isLoading, message = "Loading..." }: LoadingScreenProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        {message && (
          <p className="text-foreground text-lg font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

