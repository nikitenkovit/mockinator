import classNames from 'classnames';
import React from 'react';
import styles from './LineInput.module.css';

export interface LineInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  width?: string;
  error?: boolean;
}

export const LineInput = ({
  width,
  placeholder,
  value,
  disabled,
  ...rest
}: LineInputProps) => {
  return (
    <label
      style={{ width: `${width || '100%'}` }}
      className={classNames(styles.container, { [styles.disabled]: disabled })}
    >
      <input
        className={styles.input}
        value={value}
        disabled={disabled}
        {...rest}
      />
      <span
        className={classNames(styles.placeholder, {
          [styles.placeholderTop]: !!value,
        })}
      >
        {placeholder}
      </span>
    </label>
  );
};
