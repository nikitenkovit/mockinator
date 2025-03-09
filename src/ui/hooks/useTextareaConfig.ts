import { ResponseTypeEnum } from '@/constants';
import { Rule } from '@/types';

interface UseTextareaConfigProps {
  rule: Rule;
  updateRule: (
    id: string,
    field: keyof Rule | Partial<Rule>,
    value?: string | boolean | number,
  ) => void;
  isExtensionActive: boolean;
}

export const useTextareaConfig = ({
  rule,
  updateRule,
  isExtensionActive,
}: UseTextareaConfigProps) => {
  const common = { disabled: !isExtensionActive, rows: 10 };

  const textareaConfig = {
    [ResponseTypeEnum.Success]: {
      ...common,
      value: rule.data || '',
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        updateRule(rule.id, 'data', e.target.value),
      placeholder: 'Введите JSON mock-данные',
    },
    [ResponseTypeEnum.Error]: {
      ...common,
      value: rule.errorResponse || '',
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        updateRule(rule.id, 'errorResponse', e.target.value),
      placeholder: 'Введите JSON-ответ на ошибку',
    },
    [ResponseTypeEnum.Redirect]: {
      ...common,
      value: rule.redirectUrl || '',
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) =>
        updateRule(rule.id, 'redirectUrl', e.target.value),
      placeholder: 'URL для редиректа',
    },
  };

  return textareaConfig[rule.responseType];
};
