import React, { useState } from 'react';

export default function UserSignup({ onSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, is_admin: false }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Signup successful! You can now log in.');
        // Clear form after successful signup
        setUsername('');
        setPassword('');
        // Call the onSignup callback if provided
        if (typeof onSignup === 'function') {
          setTimeout(() => onSignup(data), 1500);
        }
      } else {
        setMsg(data.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMsg('Error connecting to server');
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-2 bg-white p-6 rounded shadow max-w-xs mx-auto mt-8">
      <h2 className="text-xl font-bold">User Signup</h2>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="border p-2" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="border p-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Sign Up</button>
      <div>{msg}</div>
    </form>
  );
} 