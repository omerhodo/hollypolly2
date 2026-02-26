'use client';

import { ConfirmModal } from '@/components/ConfirmModal';
import { useTranslations } from 'next-intl';

interface LeaveRoomModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const LeaveRoomModal: React.FC<LeaveRoomModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const t = useTranslations('leaveRoom');

  return (
    <ConfirmModal
      isOpen={isOpen}
      icon="🚪"
      title={t('title')}
      message={t('message')}
      confirmLabel={t('confirm')}
      cancelLabel={t('cancel')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
