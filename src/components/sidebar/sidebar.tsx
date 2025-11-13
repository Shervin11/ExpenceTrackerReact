import {
  Activity,
  BarChart2,
  CreditCard,
  Home,
  LogOut,
  Repeat,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  collapsed?: boolean;
  setIsOpen?: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, setIsOpen }) => {
  const [isOpen, setLocalIsOpen] = useState(!collapsed);
  const navigate = useNavigate();

  const toggle = () => {
    const newState = !isOpen;
    setLocalIsOpen(newState);
    setIsOpen?.(newState);
  };

  const menuItems =
    location.pathname.startsWith("/transactions") ||
    location.pathname.startsWith("/auto-transaction")
      ? [
          { label: "Счета", icon: <CreditCard size={20} />, path: "/home" },
          {
            label: "Транзакции",
            icon: <Activity size={20} />,
            path: "/transactions",
          },
          {
            label: "Автотранзакции",
            icon: <Repeat size={20} />,
            path: "/auto-transaction",
          },
        ]
      : [
          { label: "Счета", icon: <CreditCard size={20} />, path: "/home" },
          { label: "Отчёты", icon: <BarChart2 size={20} />, path: "/reports" },
        ];

  useEffect(() => {
    if (window.innerWidth < 768) {
      if (isOpen) toggle();
    }
  }, []);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-indigo-600 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-indigo-500">
        <span className={`font-bold text-lg ${!isOpen && "hidden"}`}>
          My App
        </span>
        <button
          onClick={toggle}
          className="p-1 cursor-pointer max-md:hidden rounded hover:bg-indigo-500"
        >
          <svg
            className={`w-5 h-5 transform transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <button
          onClick={() => navigate("/home")}
          className="p-1 cursor-pointer md:hidden rounded hover:bg-indigo-500"
        >
          <Home size={20} />
        </button>
      </div>

      <ul className={`mt-4 flex flex-col gap-1 ${!isOpen && "items-center"}`}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <li
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`transform duration-200 flex items-center gap-4 p-3 cursor-pointer rounded-md transition-all ${
                isActive ? "bg-indigo-500" : "hover:bg-indigo-500"
              }`}
            >
              {item.icon}
              <span className={`${!isOpen && "hidden"} whitespace-nowrap`}>
                {item.label}
              </span>
            </li>
          );
        })}

        <li
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
          className="transform duration-200 flex items-center gap-4 p-3 cursor-pointer hover:bg-indigo-500 rounded-md transition-all mt-auto"
        >
          <LogOut size={20} />
          <span className={`${!isOpen && "hidden"} whitespace-nowrap`}>
            Выйти
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
