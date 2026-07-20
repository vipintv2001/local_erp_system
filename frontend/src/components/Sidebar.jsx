import { NavLink } from 'react-router-dom';
import { 
  SquaresFour, 
  Users, 
  Coins, 
  Receipt, 
  ClockCounterClockwise,
  Book
} from '@phosphor-icons/react';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', path: '/', icon: SquaresFour },
    { name: 'Students', path: '/students', icon: Users },
    { name: 'Courses', path: '/courses', icon: Book },
    { name: 'Total Fees', path: '/fees', icon: Coins },
    { name: 'Add Payment', path: '/payments/add', icon: Receipt },
    { name: 'History & Prints', path: '/payments/history', icon: ClockCounterClockwise },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-full flex flex-col shadow-sm">
      <div className="h-16 flex items-center px-6 py-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-brand-700 font-bold text-xl">
          <img src="./logo.png" alt="" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <link.icon weight="duotone" className="w-5 h-5" />
            {link.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
