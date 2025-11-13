import React, { useState, useEffect } from "react";
import { Plus, X, Trash2, Edit, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getAutoTransactions,
  addAutoTransaction,
  deleteAutoTransactions,
  editAutoTransaction,
  filterAutoTransactions,
  getRecurringFrequency,
  type CreateTransactionDto,
  type recurringFrequency,
} from "../../features/autoTransactionSlice/autoTransactionSlice";
import FilterModal from "../../components/FilterModal/FilterModal";
import EditModal from "../../components/EditModalAutoTransaction/EditModalAutoTransaction";

type AutoTransactionItem = {
  id: string;
  name: string;
  amount: number;
  nextRunAt: string;
  isActive: boolean;
  categoryId: null;
  type: { id: number; name: string };
  frequency: { id: number; name: string };
};

type EditTransaction = {
  id: string;
  name: string;
  amount: number;
  categoryId: null;
  transactionTypeId: number;
  recurringFrequencyId: number;
  nextRunAt: string;
  isActive: boolean;
};

export default function AutoTransaction() {
  const dispatch = useDispatch<AppDispatch>();
  const { autoTransaction, loading, recurringFrequency } = useSelector(
    (state: RootState) => state.autoTransaction
  );

  const [selected, setSelected] = useState<string[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editData, setEditData] = useState<EditTransaction | null>(null);

  const [form, setForm] = useState<CreateTransactionDto>({
    name: "",
    amount: 0,
    categoryId: null,
    transactionTypeId: 2,
    recurringFrequencyId: 0,
    startDate: new Date().toISOString(),
  });

  const [filterForm, setFilterForm] = useState({
    Name: "",
    AmountFrom: "",
    AmountTo: "",
  });

  const transactions: AutoTransactionItem[] = autoTransaction;

  const formatNumber = (num: number) =>
    num.toLocaleString("ru-RU").replace(/\s/g, " ");
  const parseNumberInput = (str: string) => Number(str.replace(/\D/g, ""));

  useEffect(() => {
    dispatch(getAutoTransactions());
    dispatch(getRecurringFrequency());
  }, []);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selected.length) return;
    await dispatch(deleteAutoTransactions(selected)).unwrap();
    setSelected([]);
    setIsSelecting(false);
  };

  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      filterAutoTransactions({
        Name: filterForm.Name || undefined,
        AmountFrom: filterForm.AmountFrom
          ? Number(filterForm.AmountFrom)
          : undefined,
        AmountTo: filterForm.AmountTo ? Number(filterForm.AmountTo) : undefined,
      })
    ).unwrap();
    setIsFilterModalOpen(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || form.amount <= 0) return;
    setIsAdding(true);
    try {
      await dispatch(
        addAutoTransaction({ ...form, categoryId: null })
      ).unwrap();
      await dispatch(getAutoTransactions());
      setIsModalOpen(false);
      setForm({
        name: "",
        amount: 0,
        categoryId: null,
        transactionTypeId: 2,
        recurringFrequencyId: 0,
        startDate: new Date().toISOString(),
      });
    } finally {
      setIsAdding(false);
    }
  };

  const openEditModal = (tx: AutoTransactionItem) => {
    const editTx: EditTransaction = {
      id: tx.id,
      name: tx.name,
      amount: tx.amount,
      categoryId: tx.categoryId ?? null,
      transactionTypeId: tx.type?.id ?? 2,
      recurringFrequencyId: tx.frequency?.id ?? 0,
      nextRunAt: tx.nextRunAt,
      isActive: tx.isActive ?? true,
    };
    setEditData(editTx);
    setIsEditModalOpen(true);
  };

  const minNextRunAt = new Date();
  minNextRunAt.setDate(minNextRunAt.getDate() + 1);
  const minDateStr = minNextRunAt.toISOString().split("T")[0];

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

      <header className="bg-white shadow-sm mb-[30px] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <p className="font-medium md:text-xl">Автотранзакции счёта</p>
          <div className="flex items-center gap-3">
            {isSelecting ? (
              <>
                <button
                  onClick={handleDeleteSelected}
                  disabled={!selected.length}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 disabled:bg-gray-300"
                >
                  <Trash2 size={16} /> Удалить ({selected.length})
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
                  className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(true)}
                  className="p-2 rounded-full cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Search size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pb-6 flex-1 overflow-y-auto">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={`${tx.id}-${isSelecting}`}
              className={`bg-white rounded-2xl p-5 cursor-pointer relative shadow-md border mb-4 transition ${
                selected.includes(tx.id)
                  ? "border-indigo-400 shadow-md"
                  : "border-gray-200 hover:shadow-lg"
              }`}
              onClick={() => isSelecting && handleSelect(tx.id)}
            >
              {isSelecting && (
                <input
                  type="checkbox"
                  checked={selected.includes(tx.id)}
                  onChange={() => handleSelect(tx.id)}
                  className="absolute top-4 left-4 w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              )}
              <div className="flex md:gap-3 gap-2 justify-between items-start pl-8">
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-gray-800 md:text-lg">
                    {tx.name}
                  </p>
                  <p className="text-gray-400">
                    {new Date(tx.nextRunAt).toLocaleDateString("ru-RU")}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <p
                    className={`font-bold text-lg ${
                      tx.type?.id === 1 ? "text-green-600" : "text-rose-600"
                    }`}
                  >
                    {tx.type?.id === 1 ? "+" : "-"} {formatNumber(tx.amount)}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(tx);
                    }}
                    className="mt-2 text-gray-400 hover:text-indigo-600 cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Нет транзакций</div>
        )}
      </div>

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
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: parseNumberInput(e.target.value) })
                }
                placeholder="Сумма"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, transactionTypeId: 1 })}
                  className={`flex-1 py-2 rounded-xl font-semibold text-white ${
                    form.transactionTypeId === 1
                      ? "bg-green-500"
                      : "bg-gray-400 hover:bg-green-400 text-gray-700"
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
                      : "bg-gray-400 hover:bg-red-400 text-gray-700"
                  }`}
                >
                  Расход
                </button>
              </div>
              <select
                value={form.recurringFrequencyId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    recurringFrequencyId: Number(e.target.value),
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              >
                <option value={0}>Выберите частоту</option>
                {recurringFrequency.map((f: recurringFrequency) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                min={minDateStr}
                value={form.startDate.split("T")[0]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    startDate: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl cursor-pointer bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Добавить
              </button>
            </form>
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filterForm={filterForm}
        setFilterForm={setFilterForm}
        onSubmit={handleFilter}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        transaction={editData}
        recurringFrequency={recurringFrequency}
        onSave={async (data) => {
          await dispatch(editAutoTransaction(data)).unwrap();
          await dispatch(getAutoTransactions()).unwrap();
        }}
      />
    </div>
  );
}
