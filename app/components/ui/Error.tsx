interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function Error({ message = 'エラーが発生しました', onRetry }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-lg font-semibold text-red-800 mb-2">エラーが発生しました</h2>
        <p className="text-red-700 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
          >
            もう一度試す
          </button>
        )}
      </div>
    </div>
  );
}