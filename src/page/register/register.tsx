import React, { useState } from "react";
import { User, Mail, Key, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { registerUser } from "../../features/authSlice/authSlice";
import type { AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(
        registerUser({ firstName, lastName, email, password })
      ).unwrap();
      navigate("/home");
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-auto md:overflow-hidden">
      <div className="min-h-full w-full flex">
        <div className="hidden md:flex w-1/2 bg-indigo-100 items-center justify-center p-6">
          <img
            src="/illustration.svg"
            alt="Иллюстрация"
            className="w-full max-w-md max-h-[70vh] object-contain"
          />
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-5 border border-gray-200"
          >
            <h1 className="text-2xl font-bold text-gray-800 text-center">
              Создать аккаунт
            </h1>

            {error && (
              <p className="text-sm text-rose-500 text-center">{error}</p>
            )}

            <div className="relative">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Имя"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <User
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>

            <div className="relative">
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Фамилия"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <User
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>

            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <Mail
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>

            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                <Key size={16} />
                <button
                  type="button"
                  onClick={() => setShowPass((prev) => !prev)}
                  className="focus:outline-none"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-xl font-semibold transition-colors ${
                loading
                  ? "bg-indigo-400 text-white cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {loading ? "Регистрация..." : "Создать аккаунт"}
            </button>
            <p className="text-center mt-4">
              Уже есть аккаунт?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Войти
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
