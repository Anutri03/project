import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';

export default function PollResults() {
  const { pollId } = useParams();
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/polls/${pollId}/results`)
      .then(res => res.json())
      .then(setResults);

    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      socket.emit('join_poll', { poll_id: Number(pollId) });
    });
    socket.on('poll_update', data => {
      if (data.poll_id === Number(pollId)) setResults(data);
    });
    return () => socket.disconnect();
  }, [pollId]);

  if (!results) return <div>Loading results...</div>;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-2">Live Results</h3>
      <pre>{JSON.stringify(results.results, null, 2)}</pre>
    </div>
  );
} 