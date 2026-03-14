import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChannelAnalyzer from './pages/ChannelAnalyzer';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="navbar-brand">
            <h1>📊 Channel Analyzer</h1>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ChannelAnalyzer />} />
          </Routes>
        </main>
      </div>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          background: var(--color-bg-card);
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: var(--shadow-sm);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
        }

        .navbar-brand h1 {
          color: var(--color-text-primary);
          font-size: 1.5em;
          margin: 0;
        }

        .theme-toggle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 2px solid var(--color-border);
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          border: none;
        }

        .theme-toggle:hover {
          background: var(--color-bg-hover);
          transform: scale(1.1);
        }

        .theme-toggle:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .main-content {
          flex: 1;
          background: var(--color-bg-primary);
          padding: 0;
        }

        @media (max-width: 768px) {
          .navbar {
            padding: 10px 15px;
          }

          .navbar-brand h1 {
            font-size: 1.2em;
          }

          .theme-toggle {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
        }
      `}</style>
    </Router>
  );
}

export default App;
