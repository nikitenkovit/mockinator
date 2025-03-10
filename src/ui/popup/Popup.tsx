import {
  useBoolean,
  useErrorHandling,
  useExtensionState,
  useRules,
} from '../hooks';
import { Aside, Header, Rule } from './components';
import styles from './Popup.module.css';

export const Popup: React.FC = () => {
  const { error, setError } = useErrorHandling();
  const {
    rulesState,
    addRule,
    deleteRule,
    updateRule,
    resetState,
    importRules,
    exportRules,
  } = useRules(setError);
  const { isExtensionActive, toggleExtension } = useExtensionState(
    setError,
    rulesState,
  );
  const [isAsideVisible, setIsAsideVisible] = useBoolean(false);

  return (
    <main className={styles.main}>
      <div className="modal-root" />

      <Header
        isExtensionActive={isExtensionActive}
        onAddRule={addRule}
        onToggleExtension={toggleExtension}
        onResetState={resetState}
        onSetIsAsideVisible={setIsAsideVisible}
      />

      <Aside
        visible={isAsideVisible}
        rulesState={rulesState}
        onImportRules={importRules}
        onExportRules={exportRules}
        onVisibleChange={() => setIsAsideVisible.off()}
      />

      <section className={styles.content}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        <ul>
          {rulesState.ruleIds.map((ruleId) => (
            <li key={ruleId} className={styles.ruleItem}>
              <Rule
                rule={rulesState.entities[ruleId]}
                isExtensionActive={isExtensionActive}
                updateRule={updateRule}
                deleteRule={deleteRule}
                rulesCount={rulesState.ruleIds.length}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};
