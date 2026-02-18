
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import MasterData from './pages/MasterData';
import Pemasukan from './pages/Pemasukan';
import Pengeluaran from './pages/Pengeluaran';
import Rekap from './pages/Rekap';
import RekapTahunan from './pages/RekapTahunan';
import KartuStok from './pages/KartuStok';
import RekapSubunit from './pages/RekapSubunit';

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/master-data" element={<MasterData />} />
          <Route path="/pemasukan" element={<Pemasukan />} />
          <Route path="/pengeluaran" element={<Pengeluaran />} />
          <Route path="/rekap" element={<Rekap />} />
          <Route path="/rekap-tahunan" element={<RekapTahunan />} />
          <Route path="/kartu-stok" element={<KartuStok />} />
          <Route path="/rekap-subunit" element={<RekapSubunit />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
