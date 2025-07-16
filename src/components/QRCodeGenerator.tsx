import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Share2 } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  showDownload?: boolean;
  showCopy?: boolean;
  showShare?: boolean;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 200,
  title = "Join Event",
  subtitle = "Scan to participate",
  showDownload = true,
  showCopy = true,
  showShare = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [value, size]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Also generate data URL for download
      const dataUrl = await QRCode.toDataURL(value, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.download = 'slido-qr-code.png';
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Slido Event',
          text: 'Join this interactive presentation',
          url: value
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
        <p className="text-gray-600 text-sm">{subtitle}</p>
      </div>

      <div className="bg-white p-4 rounded-lg border-2 border-gray-100 mb-4">
        <canvas ref={canvasRef} className="block" />
      </div>

      <div className="text-center mb-4">
        <p className="text-sm text-gray-500 mb-1">Or go to</p>
        <p className="font-mono text-lg font-bold text-green-600">slido.com</p>
        <p className="text-sm text-gray-500">and enter code:</p>
        <p className="font-mono text-2xl font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded mt-1">
          {value.split('=')[1] || value.split('/').pop() || 'CODE'}
        </p>
      </div>

      <div className="flex gap-2">
        {showDownload && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Download QR Code"
          >
            <Download size={16} />
            Download
          </button>
        )}
        
        {showCopy && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            title="Copy Link"
          >
            <Copy size={16} />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        
        {showShare && (
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            title="Share"
          >
            <Share2 size={16} />
            Share
          </button>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;