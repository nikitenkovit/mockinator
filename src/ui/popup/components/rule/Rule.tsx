import { LineInput, LineSelect } from '@/ui/components';
import { useBoolean } from '@/ui/hooks';
import React from 'react';
import { responseExamples } from './Rule.data';
import styles from './Rule.module.css';
import { RuleProps } from './Rule.type';
import { Summary } from './components';

export const Rule = React.memo((props: RuleProps) => {
  const { rule, isExtensionActive, updateRule, deleteRule, rulesCount } = props;
  const [isOpen, setIsOpen] = useBoolean(true);

  return (
    <details open={isOpen} className={styles.container}>
      <Summary
        isExtensionActive={isExtensionActive}
        isOpen={isOpen}
        onSetIsOpen={setIsOpen}
        rule={rule}
        onDeleteRule={deleteRule}
        onUpdateRule={updateRule}
        rulesCount={rulesCount}
      />

      <div className={styles.content}>
        <div className={styles.settingsContainer}>
          <LineInput
            type="text"
            value={rule.name}
            onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
            placeholder={'Название'}
            disabled={!isExtensionActive}
          />

          <LineInput
            type="number"
            step={100}
            value={rule.delay ?? 0}
            min="0"
            onChange={(e) =>
              updateRule(rule.id, 'delay', parseInt(e.target.value, 10) || 0)
            }
            placeholder="Задержка(мс)"
            disabled={!isExtensionActive}
          />

          <LineSelect
            value={rule.method}
            onChange={(e) => updateRule(rule.id, 'method', e.target.value)}
            disabled={!isExtensionActive}
            placeholder="Метод"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </LineSelect>
        </div>

        <div className={styles.selectResponseTypeContainer}>
          <LineSelect
            value={rule.responseType}
            onChange={(e) =>
              updateRule(rule.id, 'responseType', e.target.value)
            }
            disabled={!isExtensionActive}
            placeholder="Тип ответа"
          >
            <option value="success">Успешный ответ (200)</option>
            <option value="error">Ошибка (400)</option>
            <option value="redirect">Редирект (301/302)</option>
          </LineSelect>
          {rule.responseType === 'success' && (
            <LineSelect
              value={rule.successResponseType}
              onChange={(e) => {
                const newType = e.target.value as
                  | 'json'
                  | 'text'
                  | 'html'
                  | 'xml';
                updateRule(rule.id, {
                  successResponseType: newType,
                  data: responseExamples[newType],
                });
              }}
              disabled={!isExtensionActive}
              placeholder="Тип успешного ответа"
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
            </LineSelect>
          )}
        </div>

        {rule.responseType === 'success' && (
          <textarea
            value={rule.data || ''}
            onChange={(e) => updateRule(rule.id, 'data', e.target.value)}
            placeholder="Введите mock-данные"
            disabled={!isExtensionActive}
          />
        )}

        {rule.responseType === 'error' && (
          <textarea
            value={rule.errorResponse || ''}
            onChange={(e) =>
              updateRule(rule.id, 'errorResponse', e.target.value)
            }
            placeholder="Введите JSON-ответ на ошибку"
            disabled={!isExtensionActive}
          />
        )}

        {rule.responseType === 'redirect' && (
          <input
            type="text"
            value={rule.redirectUrl || ''}
            onChange={(e) => updateRule(rule.id, 'redirectUrl', e.target.value)}
            placeholder="URL для редиректа"
            disabled={!isExtensionActive}
          />
        )}
      </div>
    </details>
  );
});
