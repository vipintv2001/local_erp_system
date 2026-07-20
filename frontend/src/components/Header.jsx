import { SignOut } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

export default function Header({ setAuth }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    setAuth(false);
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      <div className="font-semibold text-slate-700">
        TechE ERP System
      </div>
      
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-red-600 transition-colors bg-slate-50 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200"
      >
        <SignOut weight="bold" />
        Logout
      </button>
    </header>
  );
}
