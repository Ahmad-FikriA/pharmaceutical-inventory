import { useApp } from '../context/AppContext';
import { Toast } from '../types';
import { generateId } from '../utils/helpers';

export function useToast() {
  const { dispatch } = useApp();

  const showToast = (type: Toast['type'], message: string, duration: number = 3000) => {
    const id = generateId();
    dispatch({
      type: 'ADD_TOAST',
      payload: { id, type, message },
    });

    setTimeout(() => {
      dispatch({
        type: 'REMOVE_TOAST',
        payload: id,
      });
    }, duration);
  };

  const success = (message: string) => showToast('success', message);
  const error = (message: string) => showToast('error', message);
  const warning = (message: string) => showToast('warning', message);

  return { success, error, warning, showToast };
}