"use client";

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">500</h1>
        <p className="text-gray-300 mb-8">Произошла ошибка сервера</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
