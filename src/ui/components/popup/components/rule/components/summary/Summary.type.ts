import { Rule } from '@/types';
import { BooleanActions } from '@/ui/components/popup/hooks';

export interface SummaryProps {
  rule: Rule;
  rulesCount: number;
  isOpen: boolean;
  onSetIsOpen: BooleanActions;
  isExtensionActive: boolean;
  onUpdateRule: (
    id: string,
    field: keyof Rule | Partial<Rule>,
    value?: string | boolean | number,
  ) => void;
  onDeleteRule: (id: string) => void;
}
