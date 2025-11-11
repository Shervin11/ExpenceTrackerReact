import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchAccounts,
  createAccount,
  getCurrency,
  setCurrentAccount,
  deleteAccount,
  editAccount,
} from "../../features/accountSlice/accountSlice";
import type { AppDispatch, RootState } from "../../store/store";
import { MoreHorizontal, LogOut, Plus } from "lucide-react";
import { getUser } from "../../features/userSlice/userSlice";

interface Currency {
  id: number;
  name: string;
}

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { accounts, loading } = useSelector(
    (state: RootState) => state.account
  );
  const { user } = useSelector((state: RootState) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ id: string; name: string } | null>(
    null
  );

  const menuRef = useRef<HTMLDivElement>(null);

  const formatBalance = (val: number) =>
    val ? val.toLocaleString("ru-RU").replace(/,/g, " ") : "0";

  const openModal = async () => {
    setIsModalOpen(true);
    const res = await dispatch(getCurrency());
    if (getCurrency.fulfilled.match(res)) {
      setCurrencies(res.payload);
      setSelectedCurrencyId(res.payload[0]?.id ?? 1);
    }
  };

  const handleCreateAccount = async () => {
    if (!accountName.trim()) return;
    if (accountBalance.toString().startsWith("0") && accountBalance !== 0)
      return;
    await dispatch(
      createAccount({
        name: accountName,
        balance: accountBalance,
        currencyId: selectedCurrencyId,
        isDefault: false,
      })
    );
    setAccountName("");
    setAccountBalance(0);
    setIsModalOpen(false);
  };

  const handleSelectAccount = (id: string) => {
    dispatch(setCurrentAccount(id));
    navigate("/transactions");
  };

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      setEditData({ id, name: acc.name });
      setIsEditModalOpen(true);
    }
    setOpenMenuId(null);
  };

  const handleUpdateAccount = async () => {
    if (!editData?.name.trim()) return;
    await dispatch(editAccount({ ...editData, isDefault: false }));
    setIsEditModalOpen(false);
    setEditData(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await dispatch(deleteAccount(id));
    setOpenMenuId(null);
  };

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(getUser());
  }, []);

  useEffect(() => {
    const closeMenu = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", closeMenu);
    return () => document.removeEventListener("mousedown", closeMenu);
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
          <div className="flex items-center gap-2">
            <button
              onClick={openModal}
              className="w-9 h-9 cursor-pointer rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="w-9 h-9 cursor-pointer rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-indigo-700 hover:text-white"
            >
              <LogOut size={20} />
            </button>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => handleSelectAccount(acc.id)}
                className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md cursor-pointer relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === acc.id ? null : acc.id);
                  }}
                  className="absolute cursor-pointer top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-gray-100"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>

                {openMenuId === acc.id && (
                  <div
                    ref={menuRef}
                    className="absolute top-10 right-3 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 w-40"
                  >
                    <button
                      onClick={(e) => handleEdit(acc.id, e)}
                      className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => handleDelete(acc.id, e)}
                      className="block w-full text-left cursor-pointer px-4 py-2 text-sm text-rose-600 hover:bg-gray-50"
                    >
                      Удалить
                    </button>
                  </div>
                )}

                <h2 className="font-semibold text-xl text-gray-900 truncate">
                  {acc.name || "Без названия"}
                </h2>
                <p className="text-xl font-bold text-gray-800 mt-2">
                  {acc.currency.name} {formatBalance(acc.balance)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Новый счёт</h2>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Название счёта"
              className="w-full border border-gray-300 outline-none rounded-lg px-3 py-2.5 mb-3 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <input
              value={accountBalance ? formatBalance(accountBalance) : ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                if (!raw) return setAccountBalance(0);
                if (raw.length > 1 && raw.startsWith("0")) return;
                setAccountBalance(Number(raw));
              }}
              placeholder="Баланс счёта"
              inputMode="numeric"
              className="w-full border border-gray-300 outline-none rounded-lg px-3 py-2.5 mb-3 focus:ring-2 focus:ring-indigo-500"
            />
            <select
              value={selectedCurrencyId}
              onChange={(e) => setSelectedCurrencyId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-indigo-500"
            >
              {currencies.map((curr) => (
                <option key={curr.id} value={curr.id}>
                  {curr.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreateAccount}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                disabled={!accountName.trim()}
              >
                Создать
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Редактировать счёт</h2>
            <input
              value={editData?.name || ""}
              onChange={(e) =>
                setEditData((d) => (d ? { ...d, name: e.target.value } : d))
              }
              placeholder="Название счёта"
              className="w-full border border-gray-300 outline-none rounded-lg px-3 py-2.5 mb-5 focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdateAccount}
                className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Сохранить
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50"
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
