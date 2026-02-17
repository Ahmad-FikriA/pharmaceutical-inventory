import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Plus, 
  Search, 
  Trash2, 
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function Pengeluaran() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    drugId: '',
    quantity: '',
    date: new Date().toISOString().split('T')[0],
    destination: '',
    notes: ''
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const transactions = state.transactions
    .filter(t => t.type === 'pengeluaran')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredTransactions = transactions.filter(t =>
    t.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setFormData({
      drugId: '',
      quantity: '',
      date: new Date().toISOString().split('T')[0],
      destination: '',
      notes: ''
    });
    setIsOpen(true);
  };

  const calculateStock = (drugId: string) => {
    const drug = state.drugs.find(d => d.id === drugId);
    if (!drug) return 0;
    return (drug.stokAwal + drug.penerimaan) - drug.pengeluaran;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const drug = state.drugs.find(d => d.id === formData.drugId);
    if (!drug) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: 'Silakan pilih obat'
        }
      });
      return;
    }

    const qty = parseInt(formData.quantity);
    const currentStock = calculateStock(drug.id);

    if (qty > currentStock) {
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'error',
          message: `Stok tidak mencukupi (Sisa: ${currentStock})`
        }
      });
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      drugId: drug.id,
      drugName: drug.namaBarang,
      type: 'pengeluaran' as const,
      quantity: qty,
      date: formData.date,
      destination: formData.destination,
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        id: Date.now().toString(),
        type: 'success',
        message: 'Pengeluaran obat berhasil dicatat'
      }
    });
    setIsOpen(false);
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      dispatch({ type: 'DELETE_TRANSACTION', payload: deleteModal.id });
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          id: Date.now().toString(),
          type: 'success',
          message: 'Data pengeluaran berhasil dihapus'
        }
      });
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Layout
      title="Pengeluaran"
      subtitle="Kelola transaksi pengeluaran obat"
      actions={
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Pengeluaran
        </Button>
      }
    >
      <div className="space-y-6">
        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari pengeluaran..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Nama Barang</th>
                  <th className="px-6 py-3">Tujuan</th>
                  <th className="px-6 py-3">Jumlah</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center p-6">
                        <FileText className="w-12 h-12 text-gray-300 mb-2" />
                        <p>Belum ada data pengeluaran</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">
                        {formatDateTime(t.date)}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        {t.drugName}
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {t.destination || '-'}
                      </td>
                      <td className="px-6 py-3 font-medium text-red-600">
                        -{t.quantity}
                      </td>
                      <td className="px-6 py-3 text-gray-600 truncate max-w-xs">
                        {t.notes || '-'}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: t.id })}
                          className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900">Tambah Pengeluaran</h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  &times;
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Obat <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    value={formData.drugId}
                    onChange={(e) => setFormData({ ...formData, drugId: e.target.value })}
                    required
                  >
                    <option value="">Pilih Obat</option>
                    {state.drugs.map(drug => (
                      <option key={drug.id} value={drug.id}>
                        {drug.namaBarang} (Stok: {(drug.stokAwal + drug.penerimaan) - drug.pengeluaran})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Keluar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tujuan / Penerima <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    placeholder="Contoh: Unit Gawat Darurat"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keterangan
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Tambahkan catatan jika perlu..."
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4"
                  >
                    Batal
                  </Button>
                  <Button type="submit" className="px-4">
                    Simpan
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, id: null })}
          onConfirm={confirmDelete}
          title="Hapus Pengeluaran"
          message="Apakah Anda yakin ingin menghapus data pengeluaran ini? Stok obat akan dikembalikan."
        />
      </div>
    </Layout>
  );
}
