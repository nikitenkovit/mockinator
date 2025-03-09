import { BooleanActions } from '../../hooks';

export interface HeaderProps {
  onSetIsAsideVisible: BooleanActions;
  isExtensionActive: boolean;
  onToggleExtension: () => void;
  onAddRule: () => void;
  onResetState: () => void;
}
