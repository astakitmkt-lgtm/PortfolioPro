import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

export function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem 2rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>PortfolioPro</h1>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 500,
                opacity: 0.9,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
            >
              Dashboard
            </Link>
            <Link
              to="/new"
              style={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 500,
                opacity: 0.9,
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
            >
              Nuovo Progetto
            </Link>
            {(user?.role === 'Admin' || user?.role === 'PortfolioManager') && (
              <Link
                to="/admin"
                style={{
                  textDecoration: 'none',
                  color: 'white',
                  fontWeight: 500,
                  opacity: 0.9,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.9'}
              >
                Amministrazione
              </Link>
            )}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ opacity: 0.9 }}>{user?.name}</span>
          <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>({user?.role})</span>
          <button
            onClick={handleLogout}
            className="btn"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

