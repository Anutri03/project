import React, { useState } from 'react';

const pollTypes = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'word_cloud', label: 'Word Cloud' },
  { value: 'rating', label: 'Rating' },
  { value: 'open_text', label: 'Open Text' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'ranking', label: 'Ranking' },
];

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [type, setType] = useState('multiple_choice');
  const [options, setOptions] = useState(['', '']);
  const [msg, setMsg] = useState('');

  const handleOptionChange = (i, val) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };

  const addOption = () => setOptions([...options, '']);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { question, type, options: options.filter(Boolean) };
    const res = await fetch('http://localhost:5000/api/polls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Poll created!' : data.error || 'Error');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold">Create Poll</h2>
      <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Question" required className="border p-2" />
      <select value={type} onChange={e => setType(e.target.value)} className="border p-2">
        {pollTypes.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
      </select>
      {(type === 'multiple_choice' || type === 'quiz' || type === 'ranking' || type === 'word_cloud') && (
        <div className="flex flex-col gap-1">
          <h4 className="font-semibold">Options</h4>
          {options.map((opt, i) => (
            <input key={i} value={opt} onChange={e => handleOptionChange(i, e.target.value)} placeholder={`Option ${i+1}`} required className="border p-2" />
          ))}
          <button type="button" onClick={addOption} className="bg-gray-200 px-2 py-1 rounded">Add Option</button>
        </div>
      )}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
      <div>{msg}</div>
    </form>
  );
} 