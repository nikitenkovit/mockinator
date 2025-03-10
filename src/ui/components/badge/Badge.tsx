import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  color: string;
}

export const Badge = ({ children, color }: BadgeProps) => {
  return (
    <div style={{ color }} className={styles.container}>
      {children}
    </div>
  );
};
