import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import CreatePoll from './CreatePoll';
import PollVote from './PollVote';
import PollResults from './PollResults';
import Modal from './Modal';
import UserSignup from './UserSignup';
import UserLogin from './UserLogin';

const navLinks = [
  { label: 'Features', page: 'features' },
  { label: 'Use Cases', page: 'use-cases' },
  { label: 'Integrations', page: 'integrations' },
  { label: 'Pricing', page: 'pricing' },
  { label: 'Resources', page: 'resources' },
  { label: 'My Account', page: 'account' },
];

function Navbar({ onNavClick, onCreateEvent }: { onNavClick: (page: string) => void, onCreateEvent: () => void }) {
  return (
    <nav className="w-full bg-white shadow flex items-center justify-between px-8 py-4 fixed top-0 left-0 z-50">
      <div className="font-bold text-xl text-green-600 flex items-center gap-2">
        <span>Slido</span>
      </div>
      <div className="flex gap-4 items-center">
        <Link to="/" className="text-gray-700 hover:text-green-600 font-medium">Home</Link>
        <Link to="/login" className="text-gray-700 hover:text-green-600 font-medium">User Login</Link>
        <Link to="/signup" className="text-gray-700 hover:text-green-600 font-medium">Signup</Link>
        <Link to="/admin/login" className="text-gray-700 hover:text-green-600 font-medium">Admin</Link>
        {navLinks.map(link => (
          <button
            key={link.page}
            className="text-gray-700 hover:text-green-600 font-medium bg-transparent border-none outline-none cursor-pointer"
            onClick={() => onNavClick(link.label)}
          >
            {link.label}
          </button>
        ))}
        <button className="ml-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-semibold shadow" onClick={onCreateEvent}>Create slido</button>
      </div>
    </nav>
  );
}

function Dashboard() {
  return (
    <div className="w-full max-w-6xl flex gap-8 mt-8">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-8">
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-widest">AUDIENCE INTERACTION</h3>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded bg-green-50 text-green-600 font-semibold">
              <span className="material-icons">bar_chart</span> Polls <span className="ml-auto bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full">0</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
              <span className="material-icons">help</span> Q&A <span className="ml-auto text-xs text-gray-500">0</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
              <span className="material-icons">quiz</span> Quiz <span className="ml-auto text-xs text-gray-500">0</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
              <span className="material-icons">cloud</span> Word cloud <span className="ml-auto text-xs text-gray-500">0</span>
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-widest">ANALYTICS</h3>
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
              <span className="material-icons">insights</span> Live results
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50">
              <span className="material-icons">group</span> Participants <span className="ml-auto text-xs text-gray-500">0</span>
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center justify-center">
        <div className="w-full flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Polls</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded border border-gray-200 bg-white hover:bg-gray-50 font-medium">
              <span className="material-icons">add</span> Templates
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold">
              <span className="material-icons">add</span> Create poll
            </button>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-16">
          <span className="material-icons text-6xl text-gray-300 mb-4">bar_chart</span>
          <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
          <p className="text-gray-500 mb-4">Create your first poll to start engaging with your audience</p>
          <button className="px-6 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-semibold">Create poll</button>
        </div>
      </main>
    </div>
  );
}

function Home() {
  return <Dashboard />;
}

function AdminLoginWithRedirect() {
  const navigate = useNavigate();
  return <AdminLogin onLogin={() => navigate('/admin/create')} />;
}

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonPage, setComingSoonPage] = useState('');

  const handleCreateEvent = () => setModalOpen(true);
  const handleModalClose = () => {
    setModalOpen(false);
    setEventName('');
    setStartDate('');
    setEndDate('');
  };
  const handleModalSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalOpen(false);
    setEventName('');
    setStartDate('');
    setEndDate('');
  };
  const handleNavClick = (page: string) => {
    setComingSoonPage(page);
    setComingSoonOpen(true);
  };
  const handleComingSoonClose = () => setComingSoonOpen(false);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pt-[120px] flex flex-col items-center">
        <Navbar onNavClick={handleNavClick} onCreateEvent={handleCreateEvent} />
        <Modal open={modalOpen} onClose={handleModalClose}>
          <form onSubmit={handleModalSubmit} className="flex flex-col gap-6 min-w-[320px]">
            <h2 className="text-2xl font-bold text-center mb-2">When do you want to use this slido?</h2>
            <div className="flex gap-4">
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">Start date</label>
                <input type="date" className="border p-2 rounded" value={startDate} onChange={e => setStartDate(e.target.value)} required />
              </div>
              <div className="flex flex-col flex-1">
                <label className="text-gray-700 font-medium mb-1">End date</label>
                <input type="date" className="border p-2 rounded" value={endDate} onChange={e => setEndDate(e.target.value)} required />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">Give your event a name</label>
              <input className="border p-2 rounded" placeholder="Event name" value={eventName} onChange={e => setEventName(e.target.value)} required />
            </div>
            <div className="bg-gray-50 rounded p-3 text-gray-600 text-sm flex items-center gap-2">
              <span className="material-icons text-blue-500">info</span>
              Anyone with the code or link can participate
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={handleModalClose}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-500 text-white">Create slido</button>
            </div>
          </form>
        </Modal>
        <Modal open={comingSoonOpen} onClose={handleComingSoonClose}>
          <div className="flex flex-col gap-4 items-center">
            <h2 className="text-2xl font-bold">{comingSoonPage} Page</h2>
            <p className="text-gray-600 text-lg">Coming Soon!</p>
            <button className="px-4 py-2 rounded bg-green-500 text-white" onClick={handleComingSoonClose}>Close</button>
          </div>
        </Modal>
        <div className="w-full flex justify-center">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/admin/login" element={<AdminLoginWithRedirect />} />
            <Route path="/admin/create" element={<CreatePoll />} />
            <Route path="/poll/:pollId" element={<PollVote />} />
            <Route path="/poll/:pollId/results" element={<PollResults />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
