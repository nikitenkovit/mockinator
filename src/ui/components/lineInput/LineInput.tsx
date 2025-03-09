import classNames from 'classnames';
import styles from './LineInput.module.css';
import { LineInputProps } from './LineInput.type';

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
          [styles.placeholderTop]: !!value || value === 0 || value === '0',
        })}
      >
        {placeholder}
      </span>
    </label>
  );
};
