import classNames from 'classnames';
import React from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdOutlineDeleteForever } from 'react-icons/md';
import { useBoolean } from '../../../../hooks';
import { AcceptModal } from '../../../acceptModal';
import { Checkbox } from '../../../checkbox';
import styles from './Summary.module.css';
import { SummaryProps } from './Summary.type';

export const Summary = (props: SummaryProps) => {
  const {
    rule,
    rulesCount,
    isRuleValid,
    isOpen,
    onSetIsOpen,
    isExtensionActive,
    onUpdateRule,
    onDeleteRule,
  } = props;
  const [isAcceptModalVisible, setAcceptModalVisible] = useBoolean(false);

  const summaryClickHandler = (event: React.MouseEvent<HTMLElement>) => {
    const isCheckbox = (event.currentTarget as HTMLElement)
      .querySelector('[data-checkbox="true"]')
      ?.contains(event.target as Node);

    if (!isCheckbox) {
      event.preventDefault();
    }
  };

  const deleteRuleHandler = () => {
    onDeleteRule(rule.id);
    setAcceptModalVisible.off();
  };

  return (
    <summary onClick={summaryClickHandler}>
      {isAcceptModalVisible && (
        <AcceptModal
          text="Удалить правило?"
          acceptButtonText="Удалить"
          onClose={() => setAcceptModalVisible.off()}
          onAccept={deleteRuleHandler}
        />
      )}
      <div className={styles.summaryContainer}>
        <button
          onClick={() => onSetIsOpen.toggle()}
          className={styles.summaryToggle}
        >
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>

        <div className={styles.summaryInputContainer}>
          <input
            type="text"
            value={rule.path}
            onChange={(e) => onUpdateRule(rule.id, 'path', e.target.value)}
            placeholder="Введите часть пути URL"
            disabled={!isExtensionActive}
          />
          {/* {!isPathValid && (
        <span style={{ color: 'red' }}>
          Поле PATH должно содержать не менее 5 символов
        </span>
      )} */}
        </div>

        <div className={styles.summaryTools}>
          <Checkbox
            id="checkbox-id"
            checked={rule.isActive}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onUpdateRule(rule.id, 'isActive', e.target.checked);
            }}
            disabled={!isExtensionActive || !isRuleValid}
          />

          {rulesCount > 1 && (
            <button
              onClick={() => setAcceptModalVisible.on()}
              disabled={!isExtensionActive}
              className={classNames(styles.toolRemove, {
                [styles.active]: isExtensionActive,
              })}
            >
              <MdOutlineDeleteForever size={26} />
            </button>
          )}
        </div>
      </div>
    </summary>
  );
};
