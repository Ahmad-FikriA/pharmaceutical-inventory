import { Drug, AppState, AppAction } from '../types';

const SAMPLE_DRUGS: Drug[] = [
  {
    id: '1',
    namaBarang: 'Paracetamol 500mg',
    stokAwal: 100,
    penerimaan: 50,
    pengeluaran: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    satuan: 'Strip',
    harga: 5000,
  },
  {
    id: '2',
    namaBarang: 'Amoxicillin 500mg',
    stokAwal: 80,
    penerimaan: 40,
    pengeluaran: 60,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    satuan: 'Strip',
    harga: 8000,
  },
  {
    id: '3',
    namaBarang: 'Vitamin C 1000mg',
    stokAwal: 150,
    penerimaan: 100,
    pengeluaran: 80,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    satuan: 'Botol',
    harga: 15000,
  },
  {
    id: '4',
    namaBarang: 'Antasida Doen',
    stokAwal: 50,
    penerimaan: 30,
    pengeluaran: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    satuan: 'Strip',
    harga: 3000,
  },
  {
    id: '5',
    namaBarang: 'OBH Combi',
    stokAwal: 60,
    penerimaan: 40,
    pengeluaran: 55,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    satuan: 'Botol',
    harga: 12000,
  },
];

export const initialState: AppState = {
  drugs: [],
  transactions: [],
  toasts: [],
  recapNotes: {},
};

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_DATA':
      return {
        ...state,
        drugs: action.payload.drugs.length > 0 ? action.payload.drugs : SAMPLE_DRUGS,
        transactions: action.payload.transactions,
        recapNotes: action.payload.recapNotes || {},
      };

    case 'ADD_DRUG':
      return {
        ...state,
        drugs: [...state.drugs, action.payload],
      };

    case 'UPDATE_DRUG':
      return {
        ...state,
        drugs: state.drugs.map((drug) =>
          drug.id === action.payload.id ? action.payload : drug
        ),
      };

    case 'DELETE_DRUG':
      return {
        ...state,
        drugs: state.drugs.filter((drug) => drug.id !== action.payload),
        transactions: state.transactions.filter(
          (t) => t.drugId !== action.payload
        ),
      };

    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        drugs: state.drugs.map((drug) => {
          if (drug.id === action.payload.drugId) {
            if (action.payload.type === 'pemasukan') {
              return {
                ...drug,
                penerimaan: drug.penerimaan + action.payload.quantity,
                updatedAt: new Date().toISOString(),
              };
            } else {
              return {
                ...drug,
                pengeluaran: drug.pengeluaran + action.payload.quantity,
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return drug;
        }),
      };

    case 'DELETE_TRANSACTION':
      const transaction = state.transactions.find((t) => t.id === action.payload);
      if (!transaction) return state;

      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        drugs: state.drugs.map((drug) => {
          if (drug.id === transaction.drugId) {
            if (transaction.type === 'pemasukan') {
              return {
                ...drug,
                penerimaan: Math.max(0, drug.penerimaan - transaction.quantity),
                updatedAt: new Date().toISOString(),
              };
            } else {
              return {
                ...drug,
                pengeluaran: Math.max(0, drug.pengeluaran - transaction.quantity),
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return drug;
        }),
      };

    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };

    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };

    case 'UPDATE_RECAP_NOTE':
      return {
        ...state,
        recapNotes: {
          ...state.recapNotes,
          [action.payload.key]: action.payload.note,
        },
      };

    default:
      return state;
  }
}