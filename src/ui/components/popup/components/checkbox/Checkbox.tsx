import styles from './Checkbox.module.css';

export const Checkbox = ({
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => {
  return (
    <label className={styles.customCheckbox} data-checkbox="true">
      <input type="checkbox" className="visually-hidden" {...rest} />
      <span className={styles.slider}></span>
    </label>
  );
};
