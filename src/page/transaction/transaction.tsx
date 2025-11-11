import React, { useState, useEffect } from "react";
import { Plus, Search, X, TrendingUp, TrendingDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";
import {
  getTransactions,
  addTransaction,
  type CreateTransactionDto,
} from "../../features/transactionSlice/transactionSlice";
import {
  getCurrency,
  type Currency,
} from "../../features/accountSlice/accountSlice";

export default function Transaction() {
  const dispatch = useDispatch<AppDispatch>();
  const { transactions, loading } = useSelector(
    (state: RootState) => state.transaction
  );
  const { user } = useSelector((state: RootState) => state.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [form, setForm] = useState<CreateTransactionDto>({
    name: "",
    amount: 0,
    currencyId: 0,
    description: "",
    transactionTypeId: 2,
    date: new Date().toISOString(),
    categoryId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });

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

  const totalIncome = (transactions ?? [])
    .filter((t) => t.transactionTypeId === 1)
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const totalExpense = (transactions ?? [])
    .filter((t) => t.transactionTypeId === 2)
    .reduce((sum, t) => sum + (t.amount ?? 0), 0);

  const balance = totalIncome - totalExpense;

  useEffect(() => {
    dispatch(getCurrency())
      .unwrap()
      .then((res) => {
        setCurrencies(res);
        setForm((f) => ({ ...f, currencyId: res[0]?.id ?? 0 }));
      });
    dispatch(getTransactions());
  }, []);

  return (
    <div className="flex flex-col">
      {(loading || isAdding) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl flex flex-col items-center">
            <div className="w-9 h-9 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p>Загрузка...</p>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Привет, {user?.firstName || "Пользователь"}
            </h1>
            <p className="text-sm text-gray-500">Транзакции счёта</p>
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
                ₽ {(balance ?? 0).toLocaleString("ru-RU")}
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">
                  +{totalIncome.toLocaleString("ru-RU")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-rose-600">
                <TrendingDown size={16} />
                <span className="text-sm">
                  -{totalExpense.toLocaleString("ru-RU")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-6 flex-1 overflow-y-auto">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <div
              key={tx.id || index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-gray-800">{tx.name}</p>
                  <p className="text-sm text-gray-500">
                    {tx.description || "Без описания"} •{" "}
                    {new Date(tx.date).toLocaleDateString("ru-RU")}
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
                  {(tx.amount ?? 0).toLocaleString("ru-RU")}
                </p>
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
              <select
                value={form.currencyId}
                onChange={(e) =>
                  setForm({ ...form, currencyId: Number(e.target.value) })
                }
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                {currencies.length > 0 ? (
                  currencies.map((curr) => (
                    <option key={curr.id} value={curr.id}>
                      {curr.name}
                    </option>
                  ))
                ) : (
                  <option value="">Загрузка валют...</option>
                )}
              </select>
              <textarea
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
