export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-300 mb-8">Страница не найдена</p>
        <a href="/" className="text-blue-400 hover:text-blue-300">
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
