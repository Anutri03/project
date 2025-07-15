import React, { useState } from 'react';

export default function UserLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Login successful!');
        // Call the onLogin callback if provided
        if (typeof onLogin === 'function') {
          setTimeout(() => onLogin(data), 1500);
        } else {
          window.location.href = '/';
        }
      } else {
        setMsg(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMsg('Error connecting to server');
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-2 bg-white p-6 rounded shadow max-w-xs mx-auto mt-8">
      <h2 className="text-xl font-bold">User Login</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="border p-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="border p-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Log In</button>
      <div>{msg}</div>
    </form>
  );
} 