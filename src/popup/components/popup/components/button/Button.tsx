import React from 'react';
import styles from './Button.module.css';
import { ButtonProps } from './Button.type';

export const Button = (props: ButtonProps) => {
  const { onClick, children, ...rest } = props;

  return (
    <button onClick={onClick} className={styles.button} {...rest}>
      {children}
    </button>
  );
};
