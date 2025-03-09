import {
  responseExamples,
  ResponseSuccessTypeEnum,
  ResponseTypeEnum,
} from '@/constants';
import { LineInput, LineSelect, Textarea } from '@/ui/components';
import { useBoolean, useTextareaConfig } from '@/ui/hooks';
import React from 'react';
import styles from './Rule.module.css';
import { RuleProps } from './Rule.type';
import { Summary } from './components';

export const Rule = React.memo((props: RuleProps) => {
  const { rule, isExtensionActive, updateRule, deleteRule, rulesCount } = props;
  const [isOpen, setIsOpen] = useBoolean(true);
  const textareaConfig = useTextareaConfig({
    isExtensionActive,
    rule,
    updateRule,
  });

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
            <option value={ResponseTypeEnum.Success}>
              Успешный ответ (200)
            </option>
            <option value={ResponseTypeEnum.Error}>Ошибка (400)</option>
            <option value={ResponseTypeEnum.Redirect}>
              Редирект (301/302)
            </option>
          </LineSelect>
          {rule.responseType === ResponseTypeEnum.Success && (
            <LineSelect
              value={rule.successResponseType}
              onChange={(e) => {
                const newType = e.target.value as ResponseSuccessTypeEnum;
                updateRule(rule.id, {
                  successResponseType: newType,
                  data: responseExamples[newType],
                });
              }}
              disabled={!isExtensionActive}
              placeholder="Тип успешного ответа"
            >
              <option value={ResponseSuccessTypeEnum.JSON}>JSON</option>
              <option value={ResponseSuccessTypeEnum.Text}>Text</option>
              <option value={ResponseSuccessTypeEnum.HTML}>HTML</option>
              <option value={ResponseSuccessTypeEnum.XML}>XML</option>
            </LineSelect>
          )}
        </div>

        <Textarea {...textareaConfig} />
      </div>
    </details>
  );
});
