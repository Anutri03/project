import React from 'react';
import { X } from 'lucide-react';
import QRCodeGenerator from './QRCodeGenerator';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventCode: string;
  eventName?: string;
  pollId?: string;
  type?: 'event' | 'poll';
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  eventCode,
  eventName = "Interactive Event",
  pollId,
  type = 'event'
}) => {
  if (!isOpen) return null;

  // Generate the appropriate URL based on type
  const baseUrl = window.location.origin;
  let qrUrl = '';
  let title = '';
  let subtitle = '';

  if (type === 'poll' && pollId) {
    qrUrl = `${baseUrl}?poll=${pollId}&event=${eventCode}`;
    title = "Join Poll";
    subtitle = "Scan to vote on this poll";
  } else {
    qrUrl = `${baseUrl}?join=${eventCode}`;
    title = "Join Event";
    subtitle = "Scan to participate in this event";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {type === 'poll' ? 'Poll QR Code' : 'Event QR Code'}
            </h2>
            <p className="text-gray-600">
              {eventName}
            </p>
          </div>

          <QRCodeGenerator
            value={qrUrl}
            title={title}
            subtitle={subtitle}
            size={250}
          />

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">How to join:</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Scan the QR code with your phone camera</li>
              <li>2. Or go to <span className="font-mono font-bold">slido.com</span></li>
              <li>3. Enter event code: <span className="font-mono font-bold">#{eventCode}</span></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;