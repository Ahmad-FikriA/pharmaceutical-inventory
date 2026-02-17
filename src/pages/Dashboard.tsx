import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { Card, StatCard } from '../components/Card';
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import {
  formatDate,
  getStokAkhir,
  getStockStatus,
  getStockStatusColor,
  getStockStatusLabel,
} from '../utils/helpers';


export default function Dashboard() {
  const { state } = useApp();

  const totalDrugs = state.drugs.length;
  const lowStockDrugs = state.drugs.filter(
    (drug) => getStockStatus(getStokAkhir(drug)) !== 'healthy'
  );


  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = state.transactions.filter(
    (t) => t.date === today
  );

  const todayIncoming = todayTransactions.filter(
    (t) => t.type === 'pemasukan'
  ).length;
  const todayOutgoing = todayTransactions.filter(
    (t) => t.type === 'pengeluaran'
  ).length;

  const recentTransactions = state.transactions.slice(0, 5);

  return (
    <Layout
      title="Dashboard"
      subtitle="Selamat datang di Sistem Manajemen Persediaan Obat"
    >
      <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Obat"
          value={totalDrugs}
          icon={<Package className="w-6 h-6" />}
          color="blue"
        />
        <StatCard
          title="Stok Rendah"
          value={lowStockDrugs.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard
          title="Transaksi Masuk Hari Ini"
          value={todayIncoming}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <StatCard
          title="Transaksi Keluar Hari Ini"
          value={todayOutgoing}
          icon={<TrendingDown className="w-6 h-6" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Peringatan Stok Rendah
              </h2>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {lowStockDrugs.length} Item
              </span>
            </div>

            {lowStockDrugs.length > 0 ? (
              <div className="space-y-3">
                {lowStockDrugs.slice(0, 5).map((drug) => {
                  const stock = getStokAkhir(drug);
                  const status = getStockStatus(stock);
                  return (
                    <div
                      key={drug.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{drug.namaBarang}</p>
                        <p className="text-sm text-gray-500">
                          Stok tersisa: {stock} unit
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full border ${getStockStatusColor(
                          status
                        )}`}
                      >
                        {getStockStatusLabel(status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p>Semua stok dalam kondisi aman</p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaksi Terbaru
              </h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                {recentTransactions.length} Transaksi
              </span>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === 'pemasukan'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'pemasukan' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.drugName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.quantity} unit • {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>
    </Layout>
  );
}