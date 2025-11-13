import React from "react";
import { X } from "lucide-react";

interface DownloadModalProps {
  formats: { id: number; name: string }[];
  onClose: () => void;
  onSelect: (format: { id: number; name: string }) => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({
  formats,
  onClose,
  onSelect,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Скачать как</h2>

        <div className="space-y-3">
          {formats.map((format) => (
            <button
              key={format.id}
              onClick={() => onSelect(format)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 cursor-pointer transition"
            >
              {format.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
