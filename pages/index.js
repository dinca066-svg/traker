import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const Tracker = dynamic(() => import('../components/Tracker'), { ssr: false });

function LoginScreen({ onLogin }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        onLogin();
      } else {
        setError('Неверный PIN');
        setPin('');
      }
    } catch {
      setError('Ошибка соединения');
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: '20px', background: 'linear-gradient(145deg, #1a1815, #1e1b17, #1a1815)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚖️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#e8e4df', margin: '0 0 6px' }}>
          Мой трекер
        </h1>
        <p style={{ fontSize: '13px', color: '#8a8279' }}>Введите PIN для входа</p>
      </div>

      <div style={{ width: '100%', maxWidth: '280px' }}>
        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={pin}
          onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="PIN"
          autoFocus
          style={{
            width: '100%', padding: '16px', textAlign: 'center', fontSize: '24px',
            letterSpacing: '8px', background: 'rgba(0,0,0,0.3)',
            border: error ? '1px solid #c47a7a' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px', color: '#e8e4df', outline: 'none',
            fontFamily: "'DM Mono', monospace",
          }}
        />

        {error && (
          <p style={{ color: '#c47a7a', fontSize: '13px', textAlign: 'center', marginTop: '10px' }}>
            {error}
          </p>
        )}

        <button
          onClick={submit}
          disabled={!pin || loading}
          style={{
            width: '100%', marginTop: '16px', padding: '14px',
            borderRadius: '14px', border: 'none', cursor: 'pointer',
            background: 'rgba(212,168,103,0.2)', color: '#d4a867',
            fontSize: '16px', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            opacity: (!pin || loading) ? 0.4 : 1,
          }}
        >
          {loading ? '...' : 'Войти'}
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [auth, setAuth] = useState(null); // null = loading, false = not auth, true = auth

  useEffect(() => {
    fetch('/api/auth')
      .then(r => r.json())
      .then(d => setAuth(d.authenticated))
      .catch(() => setAuth(false));
  }, []);

  if (auth === null) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', background: '#1a1815', color: '#d4a867',
      }}>
        Загрузка...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Мой трекер</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      {auth ? <Tracker /> : <LoginScreen onLogin={() => setAuth(true)} />}
    </>
  );
}
