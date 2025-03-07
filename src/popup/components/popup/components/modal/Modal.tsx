import React, { type ElementRef, MouseEvent, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useBoolean } from '../../hooks';
import styles from './Modal.module.css';

export function Modal({
  onClose,
  children,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [isMounted, setIsMounted] = useBoolean(false);
  const dialogRef = useRef<ElementRef<'dialog'>>(null);
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    setIsMounted.on();
    ref.current = document.querySelector<HTMLElement>('.modal-root');

    if (isMounted && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, [isMounted]);

  function closeOnBackDropClick({
    currentTarget,
    target,
  }: MouseEvent<HTMLDialogElement>) {
    const dialogElement = currentTarget;
    const isClickedOnBackDrop = target === dialogElement;

    if (isClickedOnBackDrop) {
      onClose();
    }
  }

  return isMounted && ref.current
    ? createPortal(
        <dialog
          ref={dialogRef}
          className={styles.modal}
          onClose={onClose}
          onClick={closeOnBackDropClick}
          aria-labelledby="dialog-name"
        >
          <div className={styles.container}>
            <button
              type="button"
              className={styles.button}
              aria-label="Закрыть модальное окно"
              onClick={onClose}
            />
            {children}
          </div>
        </dialog>,
        ref.current,
      )
    : null;
}
