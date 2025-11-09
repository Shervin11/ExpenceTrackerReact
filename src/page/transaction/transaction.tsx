import React, { useState, useEffect } from "react";
import { Plus, Search, TrendingUp, TrendingDown, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getTransactions,
  addTransaction,
} from "../../features/transactionSlice/transactionSlice";
import type { CreateTransactionDto } from "../../features/transactionSlice/transactionSlice";

export default function Transaction() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.account);
  const { transactions, loading: txLoading } = useSelector(
    (state: RootState) => state.transaction
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState<CreateTransactionDto>({
    name: "",
    amount: 0,
    currencyId: 1,
    description: "",
    transactionTypeId: 2,
    date: new Date().toISOString(),
    categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });

  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || form.amount <= 0) return;
    await dispatch(addTransaction(form));
    setIsModalOpen(false);
    setForm({
      ...form,
      name: "",
      amount: 0,
      description: "",
    });
  };

  const totalIncome = transactions
    .filter((t) => t.transactionTypeId === 1)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.transactionTypeId === 2)
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Привет, {user?.firstName || "Пользователь"}!
            </h1>
            <p className="text-sm text-gray-500">Ваши транзакции</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200">
              <Search size={18} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 pt-6 pb-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Баланс</p>
              <p className="text-2xl font-bold text-gray-800">
                ₽ {balance.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-600">
                <TrendingDown size={16} />
                <span className="text-sm">
                  -{totalExpense.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6 flex-1 overflow-y-auto">
        {txLoading ? (
          <div className="text-center py-8 text-gray-500">Загрузка...</div>
        ) : transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{tx.name}</p>
                  <p className="text-sm text-gray-500">
                    {tx.description || tx.categoryId} •{" "}
                    {new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`font-semibold ${
                    tx.transactionTypeId === 1
                      ? "text-green-600"
                      : "text-rose-600"
                  }`}
                >
                  {tx.transactionTypeId === 1 ? "+" : "–"} ₽{" "}
                  {tx.amount.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">Нет транзакций</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3f343436] bg-opacity-50 flex items-center justify-center p-4 z-50">
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
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="number"
                value={form.amount || ""}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) })
                }
                placeholder="Сумма"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
                min="0.01"
                step="0.01"
              />
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Описание (опционально)"
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={form.transactionTypeId === 1}
                    onChange={() => setForm({ ...form, transactionTypeId: 1 })}
                    className="mr-2"
                  />
                  Доход
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={form.transactionTypeId === 2}
                    onChange={() => setForm({ ...form, transactionTypeId: 2 })}
                    className="mr-2"
                  />
                  Расход
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
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
