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
import { endOfMonth, isWithinInterval, parseISO, isBefore } from 'date-fns';
import * as XLSX from 'xlsx';

export default function Rekap() {
  const { state, dispatch } = useApp();

  // Default to current month and year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = [
    { value: '0', label: 'Januari' },
    { value: '1', label: 'Februari' },
    { value: '2', label: 'Maret' },
    { value: '3', label: 'April' },
    { value: '4', label: 'Mei' },
    { value: '5', label: 'Juni' },
    { value: '6', label: 'Juli' },
    { value: '7', label: 'Agustus' },
    { value: '8', label: 'September' },
    { value: '9', label: 'Oktober' },
    { value: '10', label: 'November' },
    { value: '11', label: 'Desember' },
  ];

  // Generate last 5 years
  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const recapData = useMemo(() => {
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);

    const startDate = new Date(year, month, 1);
    const endDate = endOfMonth(startDate);

    return state.drugs.map(drug => {
      // Transactions before this month
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

      // Initial Stock for this month = Global Initial + History Net Change
      const monthlyInitialStock = drug.stokAwal + historyIncoming - historyOutgoing;

      // Transactions within this month
      const monthTransactions = state.transactions.filter(t =>
        t.drugId === drug.id &&
        isWithinInterval(parseISO(t.date), { start: startDate, end: endDate })
      );

      const monthlyIncoming = monthTransactions
        .filter(t => t.type === 'pemasukan')
        .reduce((sum, t) => sum + t.quantity, 0);

      const monthlyOutgoing = monthTransactions
        .filter(t => t.type === 'pengeluaran')
        .reduce((sum, t) => sum + t.quantity, 0);

      const availableStock = monthlyInitialStock + monthlyIncoming;
      const finalStock = availableStock - monthlyOutgoing;

      // Stok optimum = Pengeluaran * 1.2
      // If pengeluaran is 0, default to 20 (based on low stock threshold of 10 * 2)
      const stokOptimum = Math.ceil(monthlyOutgoing * 1.2) || 20;

      return {
        id: drug.id,
        namaBarang: drug.namaBarang,
        stokAwal: monthlyInitialStock,
        penerimaan: monthlyIncoming,
        jumlahPersediaan: availableStock,
        pengeluaran: monthlyOutgoing,
        stokAkhir: finalStock,
        stokOptimum,
        catatan: state.recapNotes?.[`${drug.id}-${selectedMonth}-${selectedYear}`] || '',
      };
    });
  }, [state.drugs, state.transactions, selectedMonth, selectedYear, state.recapNotes]);

  const exportToExcel = () => {
    const dataToExport = recapData.map((item, index) => ({
      'No': index + 1,
      'Nama Barang': item.namaBarang,
      'Stok Awal': item.stokAwal,
      'Penerimaan': item.penerimaan,
      'Jumlah Persediaan': item.jumlahPersediaan,
      'Pengeluaran': item.pengeluaran,
      'Stok Akhir': item.stokAkhir,
      'Stok Optimum': item.stokOptimum,
      'Catatan': item.catatan,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "LPLPO");

    // Auto-width columns
    const maxWidth = dataToExport.reduce((w, r) => Math.max(w, r['Nama Barang'].length), 10);
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: maxWidth + 2 }, // Nama Barang
      { wch: 10 }, // Stok Awal
      { wch: 10 }, // Penerimaan
      { wch: 15 }, // Jumlah Persediaan
      { wch: 10 }, // Pengeluaran
      { wch: 10 }, // Stok Akhir
      { wch: 10 }, // Stok Optimum
      { wch: 30 }, // Catatan
    ];

    const fileName = `LPLPO_${months[parseInt(selectedMonth)].label}_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handleNoteChange = (drugId: string, note: string) => {
    dispatch({
      type: 'UPDATE_RECAP_NOTE',
      payload: {
        key: `${drugId}-${selectedMonth}-${selectedYear}`,
        note
      }
    });
  };

  return (
    <Layout
      title="LPLPO"
      subtitle="Laporan Pemakaian dan Lembar Permintaan Obat"
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
                <span className="text-sm font-medium text-gray-700">Periode:</span>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
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
                  <th className="px-6 py-3 text-center">Stok Awal</th>
                  <th className="px-6 py-3 text-center text-green-600">Penerimaan</th>
                  <th className="px-6 py-3 text-center font-bold">Jumlah Persediaan</th>
                  <th className="px-6 py-3 text-center text-red-600">Pengeluaran</th>
                  <th className="px-6 py-3 text-center font-bold">Stok Akhir</th>
                  <th className="px-6 py-3 text-center text-blue-600">Stok Optimum</th>
                  <th className="px-6 py-3 text-center">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recapData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center p-6">
                        <FileText className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Tidak ada data untuk periode ini</p>
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
                        {item.stokAwal}
                      </td>
                      <td className="px-6 py-3 text-center text-green-600 font-medium bg-green-50">
                        {item.penerimaan > 0 ? `+${item.penerimaan}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900 bg-gray-50">
                        {item.jumlahPersediaan}
                      </td>
                      <td className="px-6 py-3 text-center text-red-600 font-medium bg-red-50">
                        {item.pengeluaran > 0 ? `-${item.pengeluaran}` : '-'}
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
                      <td className="px-6 py-3 text-center font-medium text-blue-600 bg-blue-50">
                        {item.stokOptimum}
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="text"
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Tambah catatan..."
                          value={item.catatan}
                          onChange={(e) => handleNoteChange(item.id, e.target.value)}
                        />
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
