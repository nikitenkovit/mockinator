import classNames from 'classnames';
import React from 'react';
import { FaPlus, FaRegCirclePlay } from 'react-icons/fa6';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { useBoolean } from '../../hooks';
import { AcceptModal } from '../acceptModal';
import { Hint } from '../hint';
import styles from './Header.module.css';
import { HeaderProps } from './Header.type';

export const Header = React.memo((props: HeaderProps) => {
  const {
    onSetIsAsideVisible,
    isExtensionActive,
    onToggleExtension,
    onAddRule,
    onResetState,
  } = props;
  const [isAcceptModalVisible, setAcceptModalVisible] = useBoolean(false);

  const handleDeleteRules = () => {
    onResetState();
    setAcceptModalVisible.off();
  };

  return (
    <header className={styles.header}>
      {isAcceptModalVisible && (
        <AcceptModal
          text="Удалить все правила?"
          acceptButtonText="Удалить"
          onClose={() => setAcceptModalVisible.off()}
          onAccept={handleDeleteRules}
        />
      )}
      <button
        className={styles.openMenuButton}
        aria-label="Открыть меню"
        onClick={() => onSetIsAsideVisible.on()}
      />

      <div className={styles.tools}>
        <Hint
          text={
            isExtensionActive
              ? 'Деактивировать расширение'
              : 'Активировать расширение'
          }
        >
          <label
            className={classNames(styles.toolActive, {
              [styles.active]: isExtensionActive,
            })}
          >
            <FaRegCirclePlay size={24} />
            <input
              type="checkbox"
              className="visually-hidden"
              checked={isExtensionActive}
              onChange={onToggleExtension}
            />
          </label>
        </Hint>
        <Hint text={isExtensionActive ? 'Добавить правило' : undefined}>
          <button
            onClick={onAddRule}
            disabled={!isExtensionActive}
            className={classNames(styles.toolAdd, {
              [styles.active]: isExtensionActive,
            })}
          >
            <FaPlus size={26} />
          </button>
        </Hint>
        <Hint text={isExtensionActive ? 'Удалить все правила' : undefined}>
          <button
            onClick={() => setAcceptModalVisible.on()}
            disabled={!isExtensionActive}
            className={classNames(styles.toolRemove, {
              [styles.active]: isExtensionActive,
            })}
          >
            <MdOutlineDeleteForever size={30} />
          </button>
        </Hint>
      </div>
    </header>
  );
});
