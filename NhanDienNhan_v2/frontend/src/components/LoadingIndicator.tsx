import { Loader2 } from "lucide-react";

export function LoadingIndicator() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader2 className="h-12 w-12 text-purple-600 animate-spin mb-4" />
      <p className="text-lg font-medium text-gray-900">Đang xử lý ảnh...</p>
    </div>
  );
}
