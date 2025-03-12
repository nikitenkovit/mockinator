import { Button, Hint, Modal } from '@/ui/components';
import { useBoolean } from '@/ui/hooks';
import classNames from 'classnames';
import React from 'react';
import styles from './Aside.module.css';
import { AsideProps } from './Aside.type';
import { About } from './components';

export const Aside = React.memo(
  ({
    onImportRules,
    onExportRules,
    visible,
    onVisibleChange,
    rulesState,
  }: AsideProps) => {
    const [isModalOpen, setIsModalOpen] = useBoolean(false);

    const importHandler = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          onImportRules(file);
        }
      };
      input.click();
    };

    const isExportButtonDisabled = rulesState.ruleIds.length === 0;

    return (
      <>
        <div
          className={classNames(styles.backdrop, {
            [styles.backdropVisible]: visible,
          })}
          onClick={onVisibleChange}
        />
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen.off()}>
            <About />
          </Modal>
        )}
        <aside
          className={classNames(styles.container, {
            [styles.visible]: visible,
          })}
        >
          <div className={styles.titleContainer}>
            <h1>Mockinator</h1>
            <span>Перехват fetch-запросов и возврат mock-данных</span>
          </div>

          <div className={styles.tools}>
            <Hint
              text={
                isExportButtonDisabled
                  ? 'Добавьте хотя бы одно правило'
                  : undefined
              }
              variant="red"
            >
              <Button onClick={onExportRules} disabled={isExportButtonDisabled}>
                Экспорт правил
              </Button>
            </Hint>
            <Button onClick={importHandler}>Импорт правил</Button>
            <Button onClick={() => setIsModalOpen.on()}>Справка</Button>
          </div>
        </aside>
      </>
    );
  },
);
