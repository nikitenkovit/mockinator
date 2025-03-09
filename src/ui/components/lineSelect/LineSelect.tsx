import classNames from 'classnames';
import styles from './lineSelect.module.css';
import { LineSelectProps } from './LineSelect.type';

export const LineSelect = ({
  width,
  placeholder,
  value,
  disabled,
  children,
  ...rest
}: LineSelectProps) => {
  return (
    <label
      style={{ width: `${width || '100%'}` }}
      className={classNames(styles.container, { [styles.disabled]: disabled })}
    >
      <select
        className={styles.input}
        value={value}
        disabled={disabled}
        {...rest}
      >
        {children}
      </select>
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
