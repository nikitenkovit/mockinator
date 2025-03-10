import { RulesState } from '@/types';

export interface AsideProps {
  visible: boolean;
  onVisibleChange: () => void;
  onImportRules: (file: File) => void;
  onExportRules: () => void;
  rulesState: RulesState;
}
