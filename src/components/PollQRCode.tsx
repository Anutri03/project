import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import QRCodeModal from './QRCodeModal';

interface PollQRCodeProps {
  pollId: string;
  eventCode: string;
  pollTitle: string;
  className?: string;
}

const PollQRCode: React.FC<PollQRCodeProps> = ({
  pollId,
  eventCode,
  pollTitle,
  className = ""
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowQRModal(true)}
        className={`flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ${className}`}
        title="Show QR Code for this poll"
      >
        <QrCode size={16} />
        QR Code
      </button>

      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        eventCode={eventCode}
        eventName={pollTitle}
        pollId={pollId}
        type="poll"
      />
    </>
  );
};

export default PollQRCode;