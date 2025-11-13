import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { recurringFrequency } from "../../features/autoTransactionSlice/autoTransactionSlice";

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id: string;
    name: string;
    amount: number;
    categoryId: null;
    transactionTypeId: number;
    recurringFrequencyId: number;
    nextRunAt: string;
    isActive: boolean;
  }) => void;
  transaction: {
    id: string;
    name: string;
    amount: number;
    categoryId: null;
    transactionTypeId: number;
    recurringFrequencyId: number;
    nextRunAt: string;
    isActive: boolean;
  } | null;
  recurringFrequency: recurringFrequency[];
};

export default function EditModal({
  isOpen,
  onClose,
  onSave,
  transaction,
  recurringFrequency,
}: EditModalProps) {
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    amount: 0,
    categoryId: null,
    transactionTypeId: 2,
    recurringFrequencyId: 0,
    nextRunAt: new Date().toISOString(),
    isActive: true,
  });

  useEffect(() => {
    if (transaction) setEditData({ ...transaction });
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const minNextRunAt = new Date();
  minNextRunAt.setDate(minNextRunAt.getDate() + 1);
  const minDateStr = minNextRunAt.toISOString().split("T")[0];

  const formatNumber = (num: number) =>
    num.toLocaleString("ru-RU").replace(/\s/g, " ");

  const parseNumberInput = (str: string) => Number(str.replace(/\D/g, ""));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...editData,
      categoryId: null,
      amount: Number(editData.amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">Редактировать транзакцию</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Название"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <input
            type="text"
            value={formatNumber(editData.amount)}
            onChange={(e) =>
              setEditData({
                ...editData,
                amount: parseNumberInput(e.target.value),
              })
            }
            placeholder="Сумма"
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setEditData({ ...editData, transactionTypeId: 1 })}
              className={`flex-1 py-2 rounded-xl font-semibold text-white ${
                editData.transactionTypeId === 1
                  ? "bg-green-500"
                  : "bg-gray-400 hover:bg-green-400 text-gray-700"
              }`}
            >
              Доход
            </button>
            <button
              type="button"
              onClick={() => setEditData({ ...editData, transactionTypeId: 2 })}
              className={`flex-1 py-2 rounded-xl font-semibold text-white ${
                editData.transactionTypeId === 2
                  ? "bg-red-500"
                  : "bg-gray-400 hover:bg-red-400 text-gray-700"
              }`}
            >
              Расход
            </button>
          </div>

          <select
            value={editData.recurringFrequencyId}
            onChange={(e) =>
              setEditData({
                ...editData,
                recurringFrequencyId: Number(e.target.value),
              })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          >
            <option value={0}>Выберите частоту</option>
            {recurringFrequency.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            min={minDateStr}
            value={editData.nextRunAt.split("T")[0]}
            onChange={(e) =>
              setEditData({
                ...editData,
                nextRunAt: new Date(e.target.value).toISOString(),
              })
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editData.isActive}
              onChange={(e) =>
                setEditData({ ...editData, isActive: e.target.checked })
              }
            />
            Активна
          </label>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl cursor-pointer bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
          >
            Сохранить
          </button>
        </form>
      </div>
    </div>
  );
}
