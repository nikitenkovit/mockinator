import classNames from 'classnames';
import styles from './Button.module.css';
import { ButtonProps } from './Button.type';

export const Button = (props: ButtonProps) => {
  const { onClick, children, disabled, ...rest } = props;

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      className={classNames(styles.button, { [styles.disabled]: disabled })}
      {...rest}
    >
      {children}
    </button>
  );
};
