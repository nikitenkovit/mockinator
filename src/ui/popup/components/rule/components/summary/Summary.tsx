import { MapMethodToBadgeColorText } from '@/constants';
import { AcceptModal, Badge, Checkbox, Hint, LineInput } from '@/ui/components';
import { useBoolean } from '@/ui/hooks';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { MdOutlineDeleteForever } from 'react-icons/md';
import styles from './Summary.module.css';
import { SummaryProps } from './Summary.type';

export const Summary = (props: SummaryProps) => {
  const {
    rule,
    rulesCount,
    isOpen,
    onSetIsOpen,
    isExtensionActive,
    onUpdateRule,
    onDeleteRule,
  } = props;
  const [isAcceptModalVisible, setAcceptModalVisible] = useBoolean(false);

  const isPathValid = rule.path.length >= 5;

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

  useEffect(() => {
    if (!isPathValid) {
      onUpdateRule(rule.id, 'isActive', false);
    }
  }, [isPathValid]);

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
          <LineInput
            type="text"
            value={rule.path}
            onChange={(e) => onUpdateRule(rule.id, 'path', e.target.value)}
            placeholder={rule.name || 'Путь. Например: /api/data'}
            width="524px"
            disabled={!isExtensionActive}
          />
          <Badge color={MapMethodToBadgeColorText[rule.method]}>
            {rule.method}
          </Badge>
        </div>

        <div className={styles.summaryTools}>
          <Hint
            disabled={!isExtensionActive}
            variant={!isPathValid ? 'red' : 'green'}
            text={
              !isPathValid
                ? 'В поле "Путь" должно быть не менее 5 символов'
                : 'Активировать перехват'
            }
          >
            <Checkbox
              id="checkbox-id"
              checked={rule.isActive}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onUpdateRule(rule.id, 'isActive', e.target.checked);
              }}
              disabled={!isExtensionActive || !isPathValid}
            />
          </Hint>

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
