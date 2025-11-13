import { useState } from "react";
import Sidebar from "../sidebar/sidebar";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      <Sidebar collapsed={!isOpen} setIsOpen={setIsOpen} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-16"
        }`}
      >
        {children}
      </div>
    </div>
  );
};
