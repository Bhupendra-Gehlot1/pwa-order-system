import { useState } from 'react';
import OrderForm from './components/OrderForm';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="app">
      {/* Online/Offline Status Banner */}
      {!isOnline && (
        <div className="offline-banner">
          <span>📡</span>
          <span>You are currently offline. Some features may be unavailable.</span>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="container">
          <div className="logo-container">
            <img src="/icons/logo.png" alt="SS Clothes Sumerpur" className="logo" />
          </div>
          <h1>SS Clothes Sumerpur</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="container">
          <OrderForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <p className="footer-brand-name">SS Clothes Sumerpur</p>
            </div>
            <div className="footer-info">
              <p className="footer-address">06, Ground Floor, Pushprishi Arcade, Arya Samaj Road, Sumerpur – 306902</p>
              <p className="footer-social">
                <a href="https://instagram.com/ss__clothessumerpur" target="_blank" rel="noopener noreferrer" className="instagram-link">
                  @ss__clothessumerpur
                </a>
              </p>
            </div>
          </div>
          <p className="footer-copyright">&copy; {new Date().getFullYear()} SS Clothes Sumerpur. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
