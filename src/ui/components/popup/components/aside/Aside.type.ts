export interface AsideProps {
  visible: boolean;
  onVisibleChange: () => void;
  onImportRules: (file: File) => void;
  onExportRules: () => void;
}
