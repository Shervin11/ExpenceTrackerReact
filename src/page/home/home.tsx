import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAccounts,
  createAccount,
  getCurrency,
  setCurrentAccount,
  deleteAccount,
} from "../../features/accountSlice/accountSlice";
import type { AppDispatch, RootState } from "../../store/store";
import { MoreHorizontal } from "lucide-react";

interface Currency {
  id: number;
  name: string;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, accounts, loading } = useSelector(
    (state: RootState) => state.account
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState<number>(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const openModal = async () => {
    setIsModalOpen(true);
    const result = await dispatch(getCurrency());
    if (getCurrency.fulfilled.match(result)) {
      setCurrencies(result.payload);
      if (result.payload.length > 0) {
        setSelectedCurrencyId(result.payload[0].id);
      }
    }
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) return;
    await dispatch(
      createAccount({
        name: accountName,
        balance: accountBalance,
        currencyId: selectedCurrencyId,
        isDefault: false,
      })
    );
    await dispatch(fetchAccounts());
    setAccountName("");
    setAccountBalance(0);
    setIsModalOpen(false);
  };

  const handleSelectAccount = (accountId: string) => {
    dispatch(setCurrentAccount(accountId));
    navigate("/transactions");
  };

  const toggleMenu = (e: React.MouseEvent, accountId: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === accountId ? null : accountId);
  };

  const handleEdit = (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
  };

  const handleDelete = async (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteAccount(accountId));
    await dispatch(fetchAccounts());
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="pb-6">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user ? `Счета ${user.firstName}` : "Мои счета"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Управляйте своими финансами
            </p>
          </div>
          <button
            onClick={openModal}
            className="w-9 h-9 rounded-full bg-indigo-600 flex font-semibold text-lg items-center justify-center text-white hover:bg-indigo-700 transition-colors shadow-sm"
            aria-label="Создать счёт"
          >
            +
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Загрузка...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">💳</div>
            <p className="text-lg font-medium">Нет счетов</p>
            <p className="mt-1 text-gray-400">Создайте первый счёт</p>
          </div>
        ) : (
          <div className="space-y-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => handleSelectAccount(acc.id)}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow h-full relative"
              >
                <button
                  onClick={(e) => toggleMenu(e, acc.id)}
                  className="absolute top-3 right-3 cursor-pointer opacity-100 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100 transition-opacity"
                  aria-label="Меню счёта"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>

                {openMenuId === acc.id && (
                  <div
                    ref={menuRef}
                    className="absolute top-10 right-3 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-44"
                  >
                    <button
                      onClick={(e) => handleEdit(acc.id, e)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => handleDelete(acc.id, e)}
                      className="block w-full text-left px-4 py-2 text-sm text-rose-600 cursor-pointer hover:bg-gray-50"
                    >
                      Удалить
                    </button>
                  </div>
                )}

                <div>
                  <h2 className="font-semibold text-xl text-gray-900 truncate">
                    {acc.name || "Без названия"}
                  </h2>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    {acc.currency.name} {(acc.balance ?? 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#3f343436] bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm space-y-2 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Новый счёт
            </h2>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Название счёта"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <input
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.valueAsNumber)}
              placeholder="Баланс счёта"
              type="number"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={selectedCurrencyId}
              onChange={(e) => setSelectedCurrencyId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleCreateAccount}
                disabled={!accountName.trim()}
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium disabled:opacity-60 hover:bg-indigo-700"
              >
                Создать
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
