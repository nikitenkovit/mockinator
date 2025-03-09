import { Button } from '../button';
import { Modal } from '../modal';
import styles from './AcceptModal.module.css';

export interface AcceptModalProps {
  text: string;
  acceptButtonText?: string;
  onAccept: () => void;
  onClose: () => void;
}

export const AcceptModal = (props: AcceptModalProps) => {
  const { text, onAccept, onClose, acceptButtonText } = props;

  return (
    <Modal onClose={onClose}>
      <div className={styles.container}>
        <p>{text}</p>
        <Button onClick={onAccept}>{acceptButtonText || 'Принять'}</Button>
      </div>
    </Modal>
  );
};
