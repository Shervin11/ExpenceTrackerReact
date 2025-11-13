import React from "react";

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filterForm: {
    Name: string;
    AmountFrom: string;
    AmountTo: string;
  };
  setFilterForm: React.Dispatch<
    React.SetStateAction<{
      Name: string;
      AmountFrom: string;
      AmountTo: string;
    }>
  >;
  onSubmit: (e: React.FormEvent) => void;
};

export default function FilterModal({
  isOpen,
  onClose,
  filterForm,
  setFilterForm,
  onSubmit,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-4">Фильтр транзакций</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Название"
            value={filterForm.Name}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, Name: e.target.value }))
            }
            className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-3">
            <input
              type="number"
              value={filterForm.AmountFrom}
              onChange={(e) =>
                setFilterForm({ ...filterForm, AmountFrom: e.target.value })
              }
              placeholder="Сумма от"
              className="w-full border border-gray-300 rounded-xl px-4 outline-none py-2 focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="number"
              value={filterForm.AmountTo}
              onChange={(e) =>
                setFilterForm({ ...filterForm, AmountTo: e.target.value })
              }
              placeholder="Сумма до"
              className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Применить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-300 text-gray-700 font-semibold hover:bg-gray-400"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
