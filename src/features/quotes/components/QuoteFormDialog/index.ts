/**
 * Quote Form Dialog Components
 * 
 * Barrel export for all QuoteFormDialog sub-components.
 * Use this file to import components from the QuoteFormDialog directory.
 * 
 * @example
 * // Import container component
 * import { QuoteFormDialog } from '@/features/quotes/components/QuoteFormDialog';
 * 
 * // Import specific presentational component
 * import { QuoteFormItemRow } from '@/features/quotes/components/QuoteFormDialog/QuoteFormItemRow';
 */

// Container component (default export)
export { default, QuoteFormDialog } from './QuoteFormDialog';

// Presentational components
export { QuoteFormHeader } from './QuoteFormHeader';
export { QuoteFormMainFields } from './QuoteFormMainFields';
export { QuoteFormClientSearch, type ClientSearchResult } from './QuoteFormClientSearch';
export { QuoteFormUserSearch, type UserSearchResult } from './QuoteFormUserSearch';
export { QuoteFormItemsList } from './QuoteFormItemsList';
export { QuoteFormItemRow } from './QuoteFormItemRow';
export { QuoteFormFinancialSummary } from './QuoteFormFinancialSummary';
export { QuoteFormDescription } from './QuoteFormDescription';
export { QuoteFormActions } from './QuoteFormActions';