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
    rules,
    addRule,
    deleteRule,
    updateRule,
    resetState,
    importRules,
    exportRules,
  } = useRules(setError);
  const { isExtensionActive, toggleExtension } = useExtensionState(
    setError,
    rules,
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
        onImportRules={importRules}
        onExportRules={exportRules}
        onVisibleChange={() => setIsAsideVisible.off()}
      />

      <section className={styles.content}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        <ul>
          {rules.map((rule) => (
            <li key={rule.id} className={styles.ruleItem}>
              <Rule
                rule={rule}
                isExtensionActive={isExtensionActive}
                updateRule={updateRule}
                deleteRule={deleteRule}
                rulesCount={rules.length}
              />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
};
