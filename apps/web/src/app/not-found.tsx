export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#0f172a' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: 'bold', 
          color: 'white', 
          marginBottom: '1rem' 
        }}>404</h1>
        <p style={{ 
          color: '#cbd5e1', 
          marginBottom: '2rem' 
        }}>Страница не найдена</p>
        <a href="/" style={{ 
          color: '#60a5fa', 
          textDecoration: 'none' 
        }}>
          Вернуться на главную
        </a>
      </div>
    </div>
  );
}
