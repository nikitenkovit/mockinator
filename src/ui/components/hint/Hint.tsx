import classNames from 'classnames';
import styles from './Hint.module.css';

interface IProps {
  children: React.ReactNode;
  text?: React.ReactNode;
  width?: string;
  placement?: 'top' | 'bottom';
  variant?: 'green' | 'red';
}

export const Hint = ({
  children,
  text,
  width,
  placement = 'bottom',
  variant = 'green',
}: IProps) => {
  return (
    <div className={styles.container}>
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
