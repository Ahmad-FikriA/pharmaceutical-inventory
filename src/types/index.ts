export interface Drug {
  id: string;
  namaBarang: string;
  stokAwal: number;
  penerimaan: number;
  pengeluaran: number;
  createdAt: string;
  updatedAt: string;
  satuan: string;
  harga: number;
}

export interface DrugFormData {
  namaBarang: string;
  stokAwal: number;
  satuan: string;
  harga: number;
}

export type TransactionType = 'pemasukan' | 'pengeluaran';

export interface Transaction {
  id: string;
  drugId: string;
  drugName: string;
  type: TransactionType;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  price?: number;
  satuan?: string;
  date: string;
  source?: string;
  destination?: string;
  notes?: string;
  createdAt: string;
}

export interface TransactionFormData {
  drugId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  price: number;
  satuan: string;
  date: string;
  source?: string;
  destination?: string;
  notes?: string;
}

export interface MonthlyRecapItem {
  drugId: string;
  namaBarang: string;
  stokAwal: number;
  totalPenerimaan: number;
  jumlahPersediaan: number;
  totalPengeluaran: number;
  stokAkhir: number;
  status: 'healthy' | 'low' | 'zero';
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export interface AppState {
  drugs: Drug[];
  transactions: Transaction[];
  toasts: Toast[];
}

export type AppAction =
  | { type: 'LOAD_DATA'; payload: { drugs: Drug[]; transactions: Transaction[] } }
  | { type: 'ADD_DRUG'; payload: Drug }
  | { type: 'UPDATE_DRUG'; payload: Drug }
  | { type: 'DELETE_DRUG'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };