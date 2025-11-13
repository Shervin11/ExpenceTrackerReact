import React, { useState, useEffect } from "react";
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  Search,
  Import,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getTransactions,
  addTransaction,
  deleteTransactions,
  type CreateTransactionDto,
  editTransaction,
  filterTransactions,
  type Transaction,
} from "../../features/transactionSlice/transactionSlice";
import ImportExportModal from "../../components/ExportModal/ExportModal";

export default function Transaction() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions: rawTransactions, loading } = useSelector(
    (state: RootState) => state.transaction
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<CreateTransactionDto | null>(null);

  const [form, setForm] = useState<CreateTransactionDto>({
    id: "",
    name: "",
    amount: 0,
    description: "",
    transactionTypeId: 2,
    date: new Date().toISOString(),
    categoryId: null,
  });

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [filterForm, setFilterForm] = useState({
    Name: "",
    AmountFrom: "",
    AmountTo: "",
    DateFrom: "",
    DateTo: "",
  });

  const transactions = rawTransactions || [];

  const formatNumber = (num: number) =>
    num.toLocaleString("ru-RU").replace(/\s/g, " ");
  const parseNumberInput = (str: string) => Number(str.replace(/\D/g, ""));

  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    await dispatch(deleteTransactions(selected)).unwrap();
    setSelected([]);
    setIsSelecting(false);
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      filterTransactions({
        Name: filterForm.Name || undefined,
        AmountFrom: filterForm.AmountFrom
          ? Number(filterForm.AmountFrom)
          : undefined,
        AmountTo: filterForm.AmountTo ? Number(filterForm.AmountTo) : undefined,
        DateFrom: filterForm.DateFrom || undefined,
        DateTo: filterForm.DateTo || undefined,
      })
    ).unwrap();
    setIsFilterModalOpen(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.amount <= 0) return;
    setIsAdding(true);
    try {
      await dispatch(addTransaction({ ...form })).unwrap();
      await dispatch(getTransactions());
      setIsModalOpen(false);
      setForm({ ...form, name: "", amount: 0, description: "" });
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (tx: Transaction) => {
    setEditData({
      id: tx.id,
      name: tx.name,
      description: tx.description || "",
      amount: tx.amount,
      transactionTypeId: tx.type?.id || 2,
      date: tx.date,
      categoryId: null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    try {
      await dispatch(editTransaction(editData)).unwrap();
      await dispatch(getTransactions());
      setIsEditModalOpen(false);
      setEditData(null);
    } catch {
      alert("Ошибка при редактировании транзакции");
    }
  };

  const truncateDescription = (description: string, maxLength = 20) => {
    return description.length <= maxLength
      ? description
      : description.slice(0, maxLength) + "...";
  };

  const totalIncome = transactions
    .filter((t) => t.type?.id === 1)
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type?.id === 2)
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col">
      {(loading || isAdding) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-51">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center">
            <div className="w-9 h-9 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p>Загрузка...</p>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <p className="font-medium md:text-xl">Транзакции счёта</p>
          <div className="flex items-center gap-3">
            {isSelecting ? (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={!selected.length}
                  className="flex items-center cursor-pointer gap-1 px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 disabled:bg-gray-300"
                >
                  <Trash2 size={16} />
                  Удалить ({selected.length})
                </button>
                <button
                  onClick={() => {
                    setIsSelecting(false);
                    setSelected([]);
                  }}
                  className="text-gray-500 cursor-pointer hover:text-gray-700"
                >
                  Отмена
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsSelecting(true)}
                  className="p-2 rounded-full cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Search size={18} />
                </button>
                <button
                  onClick={() => setIsImportExportOpen(true)}
                  className="p-2 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Import size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Баланс</p>
              <p
                className={`md:text-2xl font-bold text-gray-800 ${
                  balance < 0 ? "text-rose-600" : ""
                }`}
              >
                {transactions[0]?.currency?.name} {formatNumber(balance)}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+{formatNumber(totalIncome)}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-600">
                <TrendingDown size={16} />
                <span className="text-sm">-{formatNumber(totalExpense)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-6 flex-1 overflow-y-auto">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className={`bg-white rounded-2xl cursor-pointer p-5 shadow-md border mb-4 transition ${
                selected.includes(tx.id)
                  ? "border-indigo-400 shadow-md"
                  : "border-gray-200 hover:shadow-lg"
              }`}
              onClick={() => {
                if (isSelecting) return handleSelect(tx.id);
              }}
            >
              <div className="flex md:gap-3 gap-2 justify-between items-start">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-gray-800 md:text-lg">
                    {tx.name}
                  </p>
                  <p className="text-gray-700">
                    {truncateDescription(tx.description || "Без описания")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.date).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={`font-bold text-lg ${
                      tx.type?.id === 1 ? "text-green-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type?.id === 1 ? "+" : "-"}{" "}
                    {formatNumber(tx.amount ?? 0)} {tx.currency?.name || ""}
                  </p>
                  {isSelecting ? (
                    <input
                      type="checkbox"
                      checked={selected.includes(tx.id)}
                      onChange={() => handleSelect(tx.id)}
                      className="mt-2 w-4 h-4 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(tx);
                      }}
                      className="mt-2 text-gray-400 hover:text-indigo-600 cursor-pointer"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Нет транзакций</div>
        )}
      </div>

      {isEditModalOpen && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Редактировать транзакцию</h2>
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <input
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
                placeholder="Название"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                placeholder="Описание"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl cursor-pointer bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Сохранить
              </button>
            </form>
          </div>
        </div>
      )}

      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Фильтр транзакций</h2>
            <form onSubmit={handleFilter} className="space-y-4">
              <input
                value={filterForm.Name}
                onChange={(e) =>
                  setFilterForm({ ...filterForm, Name: e.target.value })
                }
                placeholder="Название"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
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
              <div className="flex gap-3">
                <input
                  type="date"
                  value={filterForm.DateFrom}
                  onChange={(e) =>
                    setFilterForm({ ...filterForm, DateFrom: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="date"
                  value={filterForm.DateTo}
                  onChange={(e) =>
                    setFilterForm({ ...filterForm, DateTo: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 cursor-pointer text-white font-semibold hover:bg-indigo-700"
              >
                Применить фильтр
              </button>
            </form>
          </div>
        </div>
      )}

      {isImportExportOpen && (
        <ImportExportModal onClose={() => setIsImportExportOpen(false)} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Новая транзакция</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Название"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="text"
                value={formatNumber(form.amount)}
                onChange={(e) =>
                  setForm({ ...form, amount: parseNumberInput(e.target.value) })
                }
                placeholder="Сумма"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Описание (опционально)"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transactionTypeId: 1 })}
                  className={`flex-1 py-2 rounded-xl font-semibold text-white ${
                    form.transactionTypeId === 1
                      ? "bg-green-500"
                      : "bg-gray-400 hover:bg-green-400 transition-all cursor-pointer duration-300 text-gray-700"
                  }`}
                >
                  Доход
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transactionTypeId: 2 })}
                  className={`flex-1 py-2 rounded-xl font-semibold text-white ${
                    form.transactionTypeId === 2
                      ? "bg-red-500"
                      : "bg-gray-400 hover:bg-red-400 transition-all cursor-pointer duration-300 text-gray-700"
                  }`}
                >
                  Расход
                </button>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 cursor-pointer rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 mt-3"
              >
                Добавить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
