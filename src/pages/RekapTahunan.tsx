import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
  Download,
  FileText,
  Calendar,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { endOfYear, isBefore, parseISO, isWithinInterval } from 'date-fns';
import * as XLSX from 'xlsx';

export default function RekapTahunan() {
  const { state } = useApp();

  // Default to current year
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Generate last 5 years
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const recapData = useMemo(() => {
    const year = parseInt(selectedYear);
    const startDate = new Date(year, 0, 1); // Jan 1st
    const endDate = endOfYear(startDate);   // Dec 31st

    return state.drugs.map(drug => {
      // Transactions before this year
      const historyTransactions = state.transactions.filter(t =>
        t.drugId === drug.id &&
        isBefore(parseISO(t.date), startDate)
      );

      const historyIncoming = historyTransactions
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + t.quantity, 0);

      const historyOutgoing = historyTransactions
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + t.quantity, 0);

      // Initial Stock for this year
      const yearlyInitialStock = drug.stokAwal + historyIncoming - historyOutgoing;

      // Transactions within this year
      const yearTransactions = state.transactions.filter(t =>
        t.drugId === drug.id &&
        isWithinInterval(parseISO(t.date), { start: startDate, end: endDate })
      );

      const yearlyIncoming = yearTransactions
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + t.quantity, 0);

      const yearlyOutgoing = yearTransactions
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + t.quantity, 0);

      const finalStock = yearlyInitialStock + yearlyIncoming - yearlyOutgoing;

      return {
        id: drug.id,
        namaBarang: drug.namaBarang,
        stokAwalTahun: yearlyInitialStock,
        totalMasuk: yearlyIncoming,
        totalKeluar: yearlyOutgoing,
        stokAkhir: finalStock,
        totalNilai: finalStock * (drug.harga || 0)
      };
    });
  }, [state.drugs, state.transactions, selectedYear]);

  const exportToExcel = () => {
    const dataToExport = recapData.map((item, index) => ({
      'No': index + 1,
      'Nama Barang': item.namaBarang,
      'Stok Awal Tahun': item.stokAwalTahun,
      'Total Masuk': item.totalMasuk,
      'Total Keluar': item.totalKeluar,
      'Stok Akhir': item.stokAkhir,
      'Total Nilai': item.totalNilai
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Tahunan");

    // Auto-width columns
    const maxWidth = dataToExport.reduce((w, r) => Math.max(w, r['Nama Barang'].length), 10);
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: maxWidth + 2 }, // Nama Barang
      { wch: 15 }, // Stok Awal Tahun
      { wch: 15 }, // Total Masuk
      { wch: 15 }, // Total Keluar
      { wch: 15 }, // Stok Akhir
      { wch: 15 }, // Total Nilai
    ];

    const fileName = `Rekap_Tahunan_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Layout
      title="Rekapitulasi Tahunan"
      subtitle="Laporan tahunan persediaan obat"
      actions={
        <Button onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Tahun:</span>
              </div>
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="text-sm text-gray-500">
              Total {recapData.length} Item
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3 w-16">No</th>
                  <th className="px-6 py-3">Nama Barang</th>
                  <th className="px-6 py-3 text-center">Stok Awal Tahun</th>
                  <th className="px-6 py-3 text-center text-green-600">Total Masuk</th>
                  <th className="px-6 py-3 text-center text-red-600">Total Keluar</th>
                  <th className="px-6 py-3 text-center font-bold">Stok Akhir</th>
                  <th className="px-6 py-3 text-center font-bold">Total Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recapData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center p-6">
                        <FileText className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Tidak ada data untuk tahun ini</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recapData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {item.namaBarang}
                      </td>
                      <td className="px-6 py-3 text-center text-gray-600">
                        {item.stokAwalTahun}
                      </td>
                      <td className="px-6 py-3 text-center text-green-600 font-medium bg-green-50">
                        {item.totalMasuk > 0 ? `+${item.totalMasuk}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-center text-red-600 font-medium bg-red-50">
                        {item.totalKeluar > 0 ? `-${item.totalKeluar}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900">
                        {item.stokAkhir}
                        {item.stokAkhir <= 10 && (
                          <AlertTriangle className="inline-block w-4 h-4 ml-1 text-orange-500" />
                        )}
                        {item.stokAkhir === 0 && (
                          <XCircle className="inline-block w-4 h-4 ml-1 text-red-500" />
                        )}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900">
                        Rp {item.totalNilai.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
