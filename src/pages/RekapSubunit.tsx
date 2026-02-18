import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { 
  Calendar, 
  Download,
  Building2,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import * as XLSX from 'xlsx';

const SUBUNITS = [
  'Apotek',
  'UGD',
  'VK',
  'Poli Gigi',
  'Laboratorium',
  'Pustu Pasir Peteuy',
  'Posyandu'
];

export default function RekapSubunit() {
  const { state } = useApp();
  const [selectedSubunit, setSelectedSubunit] = useState(SUBUNITS[0]);
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

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  const reportData = useMemo(() => {
    return state.transactions.filter(t => {
      if (t.type !== 'pengeluaran') return false;
      
      const tDate = parseISO(t.date);
      const isMonthMatch = tDate.getMonth() === parseInt(selectedMonth);
      const isYearMatch = tDate.getFullYear() === parseInt(selectedYear);
      
      // Flexible matching for subunit destination
      const destination = t.destination?.toLowerCase() || '';
      const subunitFilter = selectedSubunit.toLowerCase();
      const isSubunitMatch = destination.includes(subunitFilter);

      return isMonthMatch && isYearMatch && isSubunitMatch;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [state.transactions, selectedSubunit, selectedMonth, selectedYear]);

  const exportToExcel = () => {
    const dataToExport = reportData.map((item, index) => ({
      'No': index + 1,
      'Tanggal': format(parseISO(item.date), 'dd/MM/yyyy'),
      'Nama Barang': item.drugName,
      'No. Batch': item.batchNumber || '-',
      'Jumlah': item.quantity,
      'Satuan': item.satuan || '-',
      'Keterangan': item.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap Subunit");

    // Auto-width columns
    ws['!cols'] = [
      { wch: 5 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
    ];

    const fileName = `Rekap_${selectedSubunit.replace(/\s+/g, '_')}_${months[parseInt(selectedMonth)].label}_${selectedYear}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <Layout
      title="Rekap Per Subunit"
      subtitle="Laporan pengeluaran obat per unit pelayanan"
      actions={
        <Button onClick={exportToExcel} disabled={reportData.length === 0} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Pelayanan
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    value={selectedSubunit}
                    onChange={(e) => setSelectedSubunit(e.target.value)}
                  >
                    {SUBUNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Periode Laporan
                </label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative w-32">
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3 w-16">No</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Nama Barang</th>
                  <th className="px-6 py-3">No. Batch</th>
                  <th className="px-6 py-3 text-center">Jumlah</th>
                  <th className="px-6 py-3">Satuan</th>
                  <th className="px-6 py-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-300 mb-3" />
                        <p>Tidak ada data pengeluaran untuk unit ini pada periode yang dipilih</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-3 text-gray-900">
                        {format(parseISO(item.date), 'dd MMM yyyy', { locale: id })}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {item.drugName}
                      </td>
                      <td className="px-6 py-3 text-gray-600 font-mono text-xs">
                        {item.batchNumber || '-'}
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {item.satuan || '-'}
                      </td>
                      <td className="px-6 py-3 text-gray-600 truncate max-w-xs">
                        {item.notes || '-'}
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
