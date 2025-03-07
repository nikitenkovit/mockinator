import { Rule } from '@/types';

/*
 * Интерфейс для пропсов компонента Rule.
 */
export interface RuleProps {
	rule: Rule;
	isExtensionActive: boolean;
	updateRule: (
		id: string,
		field: keyof Rule | Partial<Rule>,
		value?: string | boolean | number
	) => void;
	clearRuleFields: (id: string) => void;
	deleteRule: (id: string) => void;
	rulesCount: number;
}
