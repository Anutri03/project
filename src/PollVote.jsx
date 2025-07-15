import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function PollVote() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [selected, setSelected] = useState('');
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/polls/${pollId}`)
      .then(res => res.json())
      .then(setPoll);
  }, [pollId]);

  const handleVote = async (e) => {
    e.preventDefault();
    let body = {};
    if (poll.type === 'multiple_choice' || poll.type === 'quiz' || poll.type === 'ranking') {
      body.option_id = selected;
    } else {
      body.value = input;
    }
    const res = await fetch(`http://localhost:5000/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    const data = await res.json();
    setMsg(res.ok ? 'Vote submitted!' : data.error || 'Error');
  };

  if (!poll) return <div>Loading...</div>;

  return (
    <form onSubmit={handleVote} className="flex flex-col gap-2 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">{poll.question}</h2>
      {['multiple_choice', 'quiz', 'ranking'].includes(poll.type) && (
        <div className="flex flex-col gap-1">
          {poll.options.map(opt => (
            <label key={opt.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="option"
                value={opt.id}
                checked={selected === String(opt.id)}
                onChange={e => setSelected(e.target.value)}
                required
              />
              {opt.text}
            </label>
          ))}
        </div>
      )}
      {poll.type === 'word_cloud' && (
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Enter a word" required className="border p-2" />
      )}
      {poll.type === 'rating' && (
        <input type="number" min="1" max="5" value={input} onChange={e => setInput(e.target.value)} placeholder="Rate 1-5" required className="border p-2" />
      )}
      {poll.type === 'open_text' && (
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Your answer" required className="border p-2" />
      )}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Vote</button>
      <div>{msg}</div>
    </form>
  );
} 