import classNames from 'classnames';
import styles from './Hint.module.css';

interface IProps {
  children: React.ReactNode;
  text?: React.ReactNode;
  width?: string;
  placement?: 'top' | 'bottom';
  variant?: 'green' | 'red';
  disabled?: boolean;
}

export const Hint = ({
  children,
  text,
  width,
  placement = 'bottom',
  variant = 'green',
  disabled = false,
}: IProps) => {
  return (
    <div
      className={classNames(styles.container, { [styles.disabled]: disabled })}
    >
      {text && (
        <div
          className={classNames(
            styles.hint,
            styles[placement],
            styles[variant],
          )}
          style={{ width }}
        >
          {text}
        </div>
      )}
      {children}
    </div>
  );
};
