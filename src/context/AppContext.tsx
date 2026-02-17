import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import { appReducer, initialState } from './reducer';

const STORAGE_KEY = 'pharmaceutical-inventory-data';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            drugs: parsed.drugs || [],
            transactions: parsed.transactions || [],
          },
        });
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
        dispatch({
          type: 'LOAD_DATA',
          payload: { drugs: [], transactions: [] },
        });
      }
    } else {
      dispatch({
        type: 'LOAD_DATA',
        payload: { drugs: [], transactions: [] },
      });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (state.drugs.length > 0 || state.transactions.length > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          drugs: state.drugs,
          transactions: state.transactions,
        })
      );
    }
  }, [state.drugs, state.transactions]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}