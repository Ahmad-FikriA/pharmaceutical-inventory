import { useState } from 'react';

interface UseConfirmModalReturn {
  isOpen: boolean;
  openModal: (onConfirm: () => void, title?: string, message?: string) => void;
  closeModal: () => void;
  onConfirm: (() => void) | null;
  title: string;
  message: string;
}

export function useConfirmModal(): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const [title, setTitle] = useState('Konfirmasi');
  const [message, setMessage] = useState('Apakah Anda yakin ingin melanjutkan?');

  const openModal = (
    confirmCallback: () => void,
    modalTitle: string = 'Konfirmasi',
    modalMessage: string = 'Apakah Anda yakin ingin melanjutkan?'
  ) => {
    setOnConfirm(() => confirmCallback);
    setTitle(modalTitle);
    setMessage(modalMessage);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setOnConfirm(null);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    onConfirm,
    title,
    message,
  };
}