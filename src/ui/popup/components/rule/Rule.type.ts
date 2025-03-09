import { Rule } from '@/types';

export interface RuleProps {
  rule: Rule;
  isExtensionActive: boolean;
  updateRule: (
    id: string,
    field: keyof Rule | Partial<Rule>,
    value?: string | boolean | number,
  ) => void;
  deleteRule: (id: string) => void;
  rulesCount: number;
}
