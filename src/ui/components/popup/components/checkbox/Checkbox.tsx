import classNames from 'classnames';
import styles from './Checkbox.module.css';

export const Checkbox = ({
  disabled,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <label
      className={classNames(styles.customCheckbox, {
        [styles.disabled]: disabled,
      })}
      data-checkbox="true"
    >
      <input
        type="checkbox"
        className="visually-hidden"
        disabled={disabled}
        {...rest}
      />
      <span className={styles.slider}></span>
    </label>
  );
};
