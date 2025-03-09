import classNames from 'classnames';
import styles from './Textarea.module.css';
import { TextareaProps } from './Textarea.type';

export const Textarea = ({ disabled, ...rest }: TextareaProps) => {
  return (
    <textarea
      {...rest}
      className={classNames(styles.textarea, { [styles.disabled]: disabled })}
      disabled={disabled}
    />
  );
};
