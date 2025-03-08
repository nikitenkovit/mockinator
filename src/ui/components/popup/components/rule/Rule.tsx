import React from 'react';
import { useBoolean } from '../../hooks';
import { responseExamples } from './Rule.data';
import styles from './Rule.module.css';
import { RuleProps } from './Rule.type';
import { Summary } from './components';

export const Rule = React.memo((props: RuleProps) => {
  const { rule, isExtensionActive, updateRule, deleteRule, rulesCount } = props;
  const [isOpen, setIsOpen] = useBoolean(true);

  const isPathValid = rule.path.length >= 5;
  const isDataValid =
    rule.responseType === 'success'
      ? rule.data && rule.data?.length >= 2
      : true;
  const isRuleValid = Boolean(isPathValid && isDataValid);

  return (
    <details open={isOpen} className={styles.container}>
      <Summary
        isExtensionActive={isExtensionActive}
        isOpen={isOpen}
        onSetIsOpen={setIsOpen}
        rule={rule}
        isRuleValid={isRuleValid}
        onDeleteRule={deleteRule}
        onUpdateRule={updateRule}
        rulesCount={rulesCount}
      />

      <div className={styles.content}>
        <input
          type="text"
          value={rule.name}
          onChange={(e) => updateRule(rule.id, 'name', e.target.value)}
          placeholder="Введите название правила"
          disabled={!isExtensionActive}
        />

        <select
          value={rule.method}
          onChange={(e) => updateRule(rule.id, 'method', e.target.value)}
          disabled={!isExtensionActive}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
          <option value="HEAD">HEAD</option>
          <option value="OPTIONS">OPTIONS</option>
        </select>

        <select
          value={rule.responseType}
          onChange={(e) => updateRule(rule.id, 'responseType', e.target.value)}
          disabled={!isExtensionActive}
        >
          <option value="success">Успешный ответ (200)</option>
          <option value="error">Ошибка (400)</option>
          <option value="redirect">Редирект (301/302)</option>
        </select>

        {rule.responseType === 'success' && (
          <>
            <select
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
            >
              <option value="json">JSON</option>
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
            </select>
            DATA:
            <textarea
              value={rule.data || ''}
              onChange={(e) => updateRule(rule.id, 'data', e.target.value)}
              placeholder="Введите mock-данные"
              disabled={!isExtensionActive}
            />
            {/* {!isDataValid && (
                <span style={{ color: 'red' }}>
                  Поле DATA должно содержать не менее 2 символов
                </span>
              )} */}
          </>
        )}

        {rule.responseType === 'error' && (
          <div>
            <textarea
              value={rule.errorResponse || ''}
              onChange={(e) =>
                updateRule(rule.id, 'errorResponse', e.target.value)
              }
              placeholder="Введите JSON-ответ на ошибку"
              disabled={!isExtensionActive}
            />
          </div>
        )}

        {rule.responseType === 'redirect' && (
          <div>
            <input
              type="text"
              value={rule.redirectUrl || ''}
              onChange={(e) =>
                updateRule(rule.id, 'redirectUrl', e.target.value)
              }
              placeholder="URL для редиректа"
              disabled={!isExtensionActive}
            />
          </div>
        )}

        <input
          type="number"
          step={100}
          value={rule.delay ?? ''}
          onChange={(e) =>
            updateRule(rule.id, 'delay', parseInt(e.target.value, 10) || 0)
          }
          placeholder="Задержка в миллисекундах"
          min="0"
          disabled={!isExtensionActive}
        />
      </div>
    </details>
  );
});
