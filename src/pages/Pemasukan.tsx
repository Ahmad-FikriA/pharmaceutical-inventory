import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import ConfirmModal from '../components/ConfirmModal';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { useToast } from '../hooks/useToast';
import {
  Plus,
  ArrowDownLeft,
  Calendar,
  Package,
  Trash2,
  Search,
} from 'lucide-react';
import {
  formatDate,

  generateId,
  validateQuantity,
} from '../utils/helpers';
import { Transaction, TransactionFormData } from '../types';

export default function Pemasukan() {
  const { state, dispatch } = useApp();
  const { success, error } = useToast();
  const { isOpen, openModal, closeModal, onConfirm, title, message } =
    useConfirmModal();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<TransactionFormData>({
    drugId: '',
    quantity: 0,
    batchNumber: '',
    expiryDate: '',
    price: 0,
    satuan: '',
    date: new Date().toISOString().split('T')[0],
    source: '',
    notes: '',
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TransactionFormData, string>>
  >({});

  const pemasukanTransactions = state.transactions.filter(
    (t) => t.type === 'pemasukan'
  );

  const filteredTransactions = pemasukanTransactions.filter(
    (t) =>
      t.drugName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionFormData, string>> = {};

    if (!formData.drugId) {
      newErrors.drugId = 'Pilih nama obat';
    }

    if (!formData.batchNumber) {
      newErrors.batchNumber = 'Nomor Batch wajib diisi';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Tanggal Expire wajib diisi';
    }

    if (formData.price < 0) {
      newErrors.price = 'Harga tidak boleh negatif';
    }

    const quantityError = validateQuantity(formData.quantity);
    if (quantityError) {
      newErrors.quantity = quantityError;
    }

    if (!formData.date) {
      newErrors.date = 'Pilih tanggal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const drug = state.drugs.find((d) => d.id === formData.drugId);
    if (!drug) {
      error('Obat tidak ditemukan');
      return;
    }

    const transaction: Transaction = {
      id: generateId(),
      drugId: formData.drugId,
      drugName: drug.namaBarang,
      type: 'pemasukan',
      quantity: formData.quantity,
      batchNumber: formData.batchNumber,
      expiryDate: formData.expiryDate,
      price: formData.price,
      satuan: formData.satuan,
      date: formData.date,
      source: formData.source,
      notes: formData.notes,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    success('Transaksi pemasukan berhasil ditambahkan');
    handleCloseModal();
  };

  const handleDelete = (transaction: Transaction) => {
    openModal(
      () => {
        dispatch({ type: 'DELETE_TRANSACTION', payload: transaction.id });
        success('Transaksi berhasil dihapus');
      },
      'Hapus Transaksi',
      `Apakah Anda yakin ingin menghapus transaksi pemasukan "${transaction.drugName}"?`
    );
  };

  const handleOpenModal = () => {
    setFormData({
      drugId: '',
      quantity: 0,
      batchNumber: '',
      expiryDate: '',
      price: 0,
      satuan: '',
      date: new Date().toISOString().split('T')[0],
      source: '',
      notes: '',
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
  };

  return (
    <Layout
      title="Pemasukan"
      subtitle="Kelola transaksi pemasukan obat"
      actions={
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Pemasukan
        </Button>
      }
    >
      <div className="space-y-6">

      <Card>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Satuan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nomor Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sumber/Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catatan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {transaction.drugName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.satuan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.batchNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.expiryDate ? formatDate(transaction.expiryDate) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      Rp {transaction.price?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <ArrowDownLeft className="w-3 h-3 mr-1" />
                        +{transaction.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.source || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(transaction)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <ArrowDownLeft className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada transaksi pemasukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <ArrowDownLeft className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Tambah Pemasukan
                  </h2>
                  <p className="text-sm text-gray-500">
                    Catat barang masuk ke inventory
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barang *
                </label>
                <select
                  value={formData.drugId}
                  onChange={(e) => {
                    const selectedDrug = state.drugs.find((d) => d.id === e.target.value);
                    setFormData({
                      ...formData,
                      drugId: e.target.value,
                      satuan: selectedDrug?.satuan || '',
                    });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.drugId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Pilih obat...</option>
                  {state.drugs.map((drug) => (
                    <option key={drug.id} value={drug.id}>
                      {drug.namaBarang}
                    </option>
                  ))}
                </select>
                {errors.drugId && (
                  <p className="mt-1 text-sm text-red-600">{errors.drugId}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Batch *
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, batchNumber: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.batchNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.batchNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.batchNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expired Date *
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expiryDate: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.expiryDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga Beli *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.satuan}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    placeholder="Otomatis dari data obat"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber/Supplier
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Contoh: PT. Sehat Indonesia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tambahkan catatan jika diperlukan"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button type="submit" className="flex-1">
                  Simpan Transaksi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        onConfirm={onConfirm}
        title={title}
        message={message}
      />
      </div>
    </Layout>
  );
}