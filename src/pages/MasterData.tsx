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
  Search,
  Edit2,
  Trash2,
  Package,
  Calculator,
} from 'lucide-react';
import {
  getJumlahPersediaan,
  getStokAkhir,
  generateId,
} from '../utils/helpers';
import { Drug, DrugFormData } from '../types';

export default function MasterData() {
  const { state, dispatch } = useApp();
  const { success } = useToast();
  const { isOpen, openModal, closeModal, onConfirm, title, message } =
    useConfirmModal();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrug, setEditingDrug] = useState<Drug | null>(null);
  const [formData, setFormData] = useState<DrugFormData>({
    namaBarang: '',
    stokAwal: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DrugFormData, string>>>(
    {}
  );

  const filteredDrugs = state.drugs.filter((drug) =>
    drug.namaBarang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DrugFormData, string>> = {};

    if (!formData.namaBarang.trim()) {
      newErrors.namaBarang = 'Nama barang wajib diisi';
    } else if (
      state.drugs.some(
        (d) =>
          d.namaBarang.toLowerCase() === formData.namaBarang.toLowerCase() &&
          d.id !== editingDrug?.id
      )
    ) {
      newErrors.namaBarang = 'Nama barang sudah ada';
    }

    if (formData.stokAwal < 0) {
      newErrors.stokAwal = 'Stok awal tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (editingDrug) {
      dispatch({
        type: 'UPDATE_DRUG',
        payload: {
          ...editingDrug,
          namaBarang: formData.namaBarang,
          stokAwal: formData.stokAwal,
          updatedAt: new Date().toISOString(),
        },
      });
      success('Data obat berhasil diperbarui');
    } else {
      const newDrug: Drug = {
        id: generateId(),
        namaBarang: formData.namaBarang,
        stokAwal: formData.stokAwal,
        penerimaan: 0,
        pengeluaran: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_DRUG', payload: newDrug });
      success('Data obat berhasil ditambahkan');
    }

    handleCloseModal();
  };

  const handleEdit = (drug: Drug) => {
    setEditingDrug(drug);
    setFormData({
      namaBarang: drug.namaBarang,
      stokAwal: drug.stokAwal,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (drug: Drug) => {
    openModal(
      () => {
        dispatch({ type: 'DELETE_DRUG', payload: drug.id });
        success('Data obat berhasil dihapus');
      },
      'Hapus Data Obat',
      `Apakah Anda yakin ingin menghapus "${drug.namaBarang}"? Tindakan ini tidak dapat dibatalkan.`
    );
  };

  const handleOpenModal = () => {
    setEditingDrug(null);
    setFormData({ namaBarang: '', stokAwal: 0 });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDrug(null);
    setFormData({ namaBarang: '', stokAwal: 0 });
    setErrors({});
  };

  return (
    <Layout
      title="Master Data"
      subtitle="Kelola data master obat dan persediaan"
      actions={
        <Button onClick={handleOpenModal} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Obat
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
              placeholder="Cari nama obat..."
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
                  Nama Barang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok Awal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Penerimaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Persediaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pengeluaran
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok Akhir
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrugs.length > 0 ? (
                filteredDrugs.map((drug, index) => (
                  <tr key={drug.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {drug.namaBarang}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {drug.stokAwal}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      +{drug.penerimaan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calculator className="w-4 h-4 text-gray-400 mr-1" />
                        {getJumlahPersediaan(drug)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                      -{drug.pengeluaran}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-900">
                        {getStokAkhir(drug)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(drug)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(drug)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Tidak ada data obat</p>
                    <p className="text-sm">Klik "Tambah Obat" untuk menambahkan data</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in zoom-in-95 fade-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDrug ? 'Edit Data Obat' : 'Tambah Data Obat'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Barang
                </label>
                <input
                  type="text"
                  value={formData.namaBarang}
                  onChange={(e) =>
                    setFormData({ ...formData, namaBarang: e.target.value })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.namaBarang ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masukkan nama obat"
                />
                {errors.namaBarang && (
                  <p className="mt-1 text-sm text-red-600">{errors.namaBarang}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stok Awal
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stokAwal}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stokAwal: parseInt(e.target.value) || 0,
                    })
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.stokAwal ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.stokAwal && (
                  <p className="mt-1 text-sm text-red-600">{errors.stokAwal}</p>
                )}
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
                  {editingDrug ? 'Simpan Perubahan' : 'Tambah Obat'}
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