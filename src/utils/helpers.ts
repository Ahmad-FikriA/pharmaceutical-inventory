import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { Drug, Transaction, MonthlyRecapItem } from '../types';

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy', { locale: id });
  } catch {
    return dateString;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy HH:mm', { locale: id });
  } catch {
    return dateString;
  }
}

export function formatMonthYear(month: number, year: number): string {
  const date = new Date(year, month - 1, 1);
  return format(date, 'MMMM yyyy', { locale: id });
}

export function getJumlahPersediaan(drug: Drug): number {
  return drug.stokAwal + drug.penerimaan;
}

export function getStokAkhir(drug: Drug): number {
  return getJumlahPersediaan(drug) - drug.pengeluaran;
}

export function getStockStatus(stock: number): 'healthy' | 'low' | 'zero' {
  if (stock === 0) return 'zero';
  if (stock <= 10) return 'low';
  return 'healthy';
}

export function getStockStatusColor(status: 'healthy' | 'low' | 'zero'): string {
  switch (status) {
    case 'healthy':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'low':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'zero':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export function getStockStatusLabel(status: 'healthy' | 'low' | 'zero'): string {
  switch (status) {
    case 'healthy':
      return 'Aman';
    case 'low':
      return 'Rendah';
    case 'zero':
      return 'Habis';
    default:
      return '-';
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: number,
  year: number
): Transaction[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return isWithinInterval(date, { start, end });
  });
}

export function calculateMonthlyRecap(
  drugs: Drug[],
  transactions: Transaction[],
  month: number,
  year: number
): MonthlyRecapItem[] {
  const monthTransactions = filterTransactionsByMonth(transactions, month, year);

  return drugs.map((drug) => {
    const drugTransactions = monthTransactions.filter((t) => t.drugId === drug.id);
    const totalPenerimaan = drugTransactions
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.quantity, 0);
    const totalPengeluaran = drugTransactions
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.quantity, 0);

    const jumlahPersediaan = drug.stokAwal + totalPenerimaan;
    const stokAkhir = jumlahPersediaan - totalPengeluaran;

    return {
      drugId: drug.id,
      namaBarang: drug.namaBarang,
      stokAwal: drug.stokAwal,
      totalPenerimaan,
      jumlahPersediaan,
      totalPengeluaran,
      stokAkhir,
      status: getStockStatus(stokAkhir),
    };
  });
}

export function getAvailableStock(drug: Drug): number {
  return getStokAkhir(drug);
}

export function validateQuantity(quantity: number, availableStock?: number): string | null {
  if (!quantity || quantity <= 0) {
    return 'Jumlah harus lebih dari 0';
  }
  if (!Number.isInteger(quantity)) {
    return 'Jumlah harus berupa angka bulat';
  }
  if (availableStock !== undefined && quantity > availableStock) {
    return `Stok tidak mencukupi. Tersedia: ${availableStock}`;
  }
  return null;
}