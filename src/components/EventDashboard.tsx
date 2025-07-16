import React, { useState } from 'react';
import { QrCode, Users, BarChart3, MessageSquare, Cloud, Settings, Share2 } from 'lucide-react';
import QRCodeModal from './QRCodeModal';

interface EventDashboardProps {
  eventCode: string;
  eventName: string;
  participantCount?: number;
}

const EventDashboard: React.FC<EventDashboardProps> = ({
  eventCode,
  eventName,
  participantCount = 0
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeTab, setActiveTab] = useState('polls');

  const tabs = [
    { id: 'polls', label: 'Polls', icon: BarChart3, count: 0 },
    { id: 'qa', label: 'Q&A', icon: MessageSquare, count: 0 },
    { id: 'wordcloud', label: 'Word cloud', icon: Cloud, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{eventName}</h1>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              #{eventCode}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Users size={20} />
              <span className="font-medium">{participantCount}</span>
            </div>
            
            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <QrCode size={20} />
              QR Code
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
              <Share2 size={20} />
              Share
            </button>
            
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-400 mb-4 tracking-widest uppercase">
              Audience Interaction
            </h3>
            
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-green-50 text-green-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="flex-1">{tab.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      activeTab === tab.id
                        ? 'bg-green-200 text-green-800'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab}</h2>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Templates
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
                  Create {activeTab.slice(0, -1)}
                </button>
              </div>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {React.createElement(tabs.find(t => t.id === activeTab)?.icon || BarChart3, {
                  size: 32,
                  className: "text-gray-400"
                })}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No {activeTab} yet
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Create your first {activeTab.slice(0, -1)} to start engaging with your audience
              </p>
              <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                Create {activeTab.slice(0, -1)}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        eventCode={eventCode}
        eventName={eventName}
        type="event"
      />
    </div>
  );
};

export default EventDashboard;