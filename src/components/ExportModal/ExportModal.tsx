import { useState } from "react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import {
  getImportTemplate,
  importTransactions,
  exportTransactions,
  getTransactions,
} from "../../features/transactionSlice/transactionSlice";
import type { AppDispatch } from "../../store/store";

interface ImportExportModalProps {
  onClose: () => void;
}

export default function ImportExportModal({ onClose }: ImportExportModalProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [mode, setMode] = useState<"import" | "export" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [exportDateFrom, setExportDateFrom] = useState("");
  const [exportDateTo, setExportDateTo] = useState("");
  const [exportFormat, setExportFormat] = useState<1 | 2>(1);

  const handleImportTemplate = (format: 1 | 2) => {
    dispatch(getImportTemplate(format));
  };

  const handleImport = async () => {
    if (!file) {
      alert("Выберите файл для импорта");
      return;
    }
    await dispatch(importTransactions(file));
    await dispatch(getTransactions());
    setFile(null);
    onClose();
  };

  const handleExport = async () => {
    if (!exportFormat) {
      alert("Выберите формат для экспорта");
      return;
    }
    await dispatch(
      exportTransactions({
        DateFrom: exportDateFrom || undefined,
        DateTo: exportDateTo || undefined,
        DocumentExtensionId: exportFormat,
      })
    );
    await dispatch(getTransactions());
    onClose();
  };

  if (!mode)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-4">Импорт или Экспорт</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setMode("import")}
              className="flex-1 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600"
            >
              Импорт
            </button>
            <button
              onClick={() => setMode("export")}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600"
            >
              Экспорт
            </button>
          </div>
        </div>
      </div>
    );

  if (mode === "import")
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold mb-4">Импорт транзакций</h2>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => handleImportTemplate(1)}
              className="flex-1 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
            >
              Получить шаблон XLSX
            </button>
            <button
              onClick={() => handleImportTemplate(2)}
              className="flex-1 py-2 rounded-xl bg-gray-300 hover:bg-gray-400"
            >
              Получить шаблон CSV
            </button>
          </div>
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={(e) => e.target.files && setFile(e.target.files[0])}
            className="w-full mb-4"
          />
          <button
            onClick={handleImport}
            className="w-full py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600"
          >
            Импортировать
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Экспорт транзакций</h2>
        <div className="flex flex-col gap-2 mb-4">
          <input
            type="date"
            value={exportDateFrom}
            onChange={(e) => setExportDateFrom(e.target.value)}
            className="w-full border border-gray-300 rounded-xl outline-none px-4 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Дата с"
          />
          <input
            type="date"
            value={exportDateTo}
            onChange={(e) => setExportDateTo(e.target.value)}
            className="w-full border border-gray-300 rounded-xl outline-none px-4 py-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Дата до"
          />
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(Number(e.target.value) as 1 | 2)}
            className="w-full border border-gray-300 outline-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400"
          >
            <option value={1}>XLSX</option>
            <option value={2}>CSV</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="w-full py-2.5 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600"
        >
          Экспортировать
        </button>
      </div>
    </div>
  );
}
