import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Calendar, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  FileText,
  Package,
  ArrowLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { 
  format, 
  parseISO, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  isBefore, 
  isValid
} from 'date-fns';
import { id } from 'date-fns/locale';

export default function KartuStok() {
  const { state } = useApp();
  const [view, setView] = useState<'catalog' | 'detail'>('catalog');
  const [selectedDrugId, setSelectedDrugId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const selectedDrug = state.drugs.find(d => d.id === selectedDrugId);

  // Catalog Data
  const filteredDrugs = useMemo(() => {
    return state.drugs.filter(drug => 
      drug.namaBarang.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(drug => {
      // Calculate current real-time stock
      const currentStock = (drug.stokAwal + drug.penerimaan) - drug.pengeluaran;
      return {
        ...drug,
        currentStock
      };
    });
  }, [state.drugs, searchQuery]);

  // Detail Data
  const stockData = useMemo(() => {
    if (!selectedDrugId || !selectedDrug) return null;

    const start = startOfDay(new Date(startDate));
    const end = endOfDay(new Date(endDate));

    if (!isValid(start) || !isValid(end)) return null;

    // Filter transactions for this drug
    const drugTransactions = state.transactions
      .filter(t => t.drugId === selectedDrugId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate initial stock before the start date
    const previousTransactions = drugTransactions.filter(t => 
      isBefore(parseISO(t.date), start)
    );

    const incomingBefore = previousTransactions
      .filter(t => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.quantity, 0);

    const outgoingBefore = previousTransactions
      .filter(t => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.quantity, 0);

    // Saldo Awal Logic: Master Stok Awal + (In Before - Out Before)
    let currentBalance = selectedDrug.stokAwal + incomingBefore - outgoingBefore;
    const initialBalance = currentBalance;

    // Get transactions within range
    const rangeTransactions = drugTransactions.filter(t => 
      isWithinInterval(parseISO(t.date), { start, end })
    );

    // Map to table data with running balance
    const data = rangeTransactions.map(t => {
      const masuk = t.type === 'pemasukan' ? t.quantity : 0;
      const keluar = t.type === 'pengeluaran' ? t.quantity : 0;
      
      const balanceBefore = currentBalance;
      currentBalance = currentBalance + masuk - keluar;

      return {
        id: t.id,
        date: t.date,
        type: t.type,
        keterangan: t.notes || (t.type === 'pemasukan' ? `Dari: ${t.source || '-'}` : `Ke: ${t.destination || '-'}`),
        masuk,
        keluar,
        saldoAwal: balanceBefore,
        sisa: currentBalance,
        batchNumber: t.batchNumber
      };
    });

    return {
      initialBalance,
      transactions: data,
      finalBalance: currentBalance
    };

  }, [selectedDrugId, selectedDrug, startDate, endDate, state.transactions]);

  const handleCardClick = (drugId: string) => {
    setSelectedDrugId(drugId);
    setView('detail');
  };

  const handleBackToCatalog = () => {
    setView('catalog');
    setSelectedDrugId('');
  };

  // --- RENDER CATALOG VIEW ---
  if (view === 'catalog') {
    return (
      <Layout
        title="Kartu Stok"
        subtitle="Katalog stok obat"
      >
        <div className="space-y-8">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama obat, kategori..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Grid Catalog */}
          {filteredDrugs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold text-lg">Tidak ada obat ditemukan</p>
              <p className="text-gray-500">Coba kata kunci lain atau tambah obat baru</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrugs.map((drug) => {
                const stockPercent = Math.min(100, (drug.currentStock / 100) * 100); // Assuming 100 is a "safe" max for visually scaling
                const isLow = drug.currentStock <= 10;
                const isEmpty = drug.currentStock === 0;
                
                let statusColor = 'bg-blue-500';
                let statusBg = 'bg-blue-50 text-blue-700 border-blue-100';
                let statusLabel = 'Tersedia';

                if (isEmpty) {
                  statusColor = 'bg-red-500';
                  statusBg = 'bg-red-50 text-red-700 border-red-100';
                  statusLabel = 'Habis';
                } else if (isLow) {
                  statusColor = 'bg-orange-500';
                  statusBg = 'bg-orange-50 text-orange-700 border-orange-100';
                  statusLabel = 'Menipis';
                } else {
                    statusColor = 'bg-green-500';
                    statusBg = 'bg-green-50 text-green-700 border-green-100';
                    statusLabel = 'Aman';
                }

                return (
                  <div 
                    key={drug.id}
                    onClick={() => handleCardClick(drug.id)}
                    className="group relative bg-white rounded-[20px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-300 cursor-pointer overflow-hidden"
                  >
                    {/* Top Status Bar */}
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${statusColor} opacity-0 group-hover:opacity-100 transition-opacity`} />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-mono font-medium text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">
                        #{drug.id.slice(-4)}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBg}`}>
                        {statusLabel.toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
                        {drug.namaBarang}
                      </h3>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-xs text-gray-500 font-medium">Stok Tersedia</span>
                          <div className="text-right">
                             <span className="text-2xl font-bold text-gray-900 tracking-tight">{drug.currentStock}</span>
                             <span className="text-xs text-gray-400 ml-1 font-medium">{drug.satuan}</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${statusColor} opacity-80 transition-all duration-500`}
                            style={{ width: `${isEmpty ? 0 : Math.max(5, stockPercent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2.5">
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:scale-110 transition-transform">
                            <Package className="w-3.5 h-3.5" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider">Satuan</span>
                            <span className="text-xs font-semibold text-gray-700">{drug.satuan}</span>
                         </div>
                      </div>
                      
                      <button className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // --- RENDER DETAIL VIEW ---
  return (
    <Layout
      title="Detail Kartu Stok"
      subtitle="Riwayat lengkap mutasi barang"
      actions={
        <Button onClick={handleBackToCatalog} variant="secondary" className="flex items-center gap-2 hover:bg-gray-100 border-transparent">
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Detail Header Card */}
        {selectedDrug && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedDrug.namaBarang}</h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">ID: {selectedDrug.id}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">Satuan: <span className="font-medium text-gray-900">{selectedDrug.satuan}</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
              <div>
                <p className="text-sm text-gray-500 mb-1">Stok Saat Ini</p>
                <p className="text-3xl font-bold text-gray-900">
                   {(selectedDrug.stokAwal + selectedDrug.penerimaan) - selectedDrug.pengeluaran}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Harga</p>
                <p className="text-3xl font-bold text-gray-900">
                   Rp {selectedDrug.harga?.toLocaleString() ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <div className="p-6 space-y-6">
            {/* Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <h3 className="font-bold text-gray-900">Periode Mutasi</h3>
                <p className="text-xs text-gray-500">Filter berdasarkan tanggal transaksi</p>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input
                    type="date"
                    className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <span className="text-gray-400 font-medium">-</span>
                <div className="relative">
                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input
                    type="date"
                    className="pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Saldo Awal</p>
                <p className="text-xl font-bold text-gray-900">{stockData?.initialBalance ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl border border-green-100 bg-green-50/50 shadow-sm">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Total Masuk</p>
                <p className="text-xl font-bold text-green-700">+{stockData?.transactions.reduce((sum, t) => sum + t.masuk, 0) ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 shadow-sm">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-2">Total Keluar</p>
                <p className="text-xl font-bold text-red-700">-{stockData?.transactions.reduce((sum, t) => sum + t.keluar, 0) ?? 0}</p>
              </div>
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 shadow-sm">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Stok Akhir</p>
                <p className="text-xl font-bold text-blue-700">{stockData?.finalBalance ?? 0}</p>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Tanggal</th>
                    <th className="px-6 py-4">No. Batch</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-center">Awal</th>
                    <th className="px-6 py-4 text-center">Masuk</th>
                    <th className="px-6 py-4 text-center">Keluar</th>
                    <th className="px-6 py-4 text-center">Sisa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {!stockData?.transactions.length ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900">Belum ada mutasi</p>
                          <p className="text-xs text-gray-500 mt-1">Tidak ada transaksi pada periode ini</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stockData.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium whitespace-nowrap">
                          {format(parseISO(t.date), 'dd MMM yyyy', { locale: id })}
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                          {t.batchNumber || '-'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            {t.type === 'pemasukan' ? (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <ArrowDownLeft className="w-3 h-3 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <ArrowUpRight className="w-3 h-3 text-red-600" />
                              </div>
                            )}
                            <span className="truncate max-w-[200px]" title={t.keterangan}>{t.keterangan}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-gray-400 font-mono">
                          {t.saldoAwal}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {t.masuk > 0 ? (
                            <span className="inline-block px-2 py-1 rounded-md bg-green-50 text-green-700 font-semibold text-xs border border-green-100 shadow-sm">
                              +{t.masuk}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {t.keluar > 0 ? (
                            <span className="inline-block px-2 py-1 rounded-md bg-red-50 text-red-700 font-semibold text-xs border border-red-100 shadow-sm">
                              -{t.keluar}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-gray-900 font-mono bg-amber-50/30">
                          {t.sisa}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
