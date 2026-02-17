import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Pill,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/master-data', label: 'Master Data', icon: Package },
  { path: '/pemasukan', label: 'Pemasukan', icon: ArrowDownLeft },
  { path: '/pengeluaran', label: 'Pengeluaran', icon: ArrowUpRight },
  { path: '/rekap', label: 'Rekap Bulanan', icon: FileText },
];

export default function Sidebar() {


  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Pill className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary leading-tight">
              Sistem Inventory
            </h1>
            <p className="text-xs text-medical-muted">Manajemen Obat</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;


          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="bg-accent-light rounded-lg p-4">
          <p className="text-xs text-primary font-medium mb-1">Versi 1.0.0</p>
          <p className="text-xs text-gray-500">Sistem Manajemen Persediaan Obat</p>
        </div>
      </div>
    </aside>
  );
}