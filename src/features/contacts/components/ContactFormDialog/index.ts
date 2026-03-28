/**
 * Contact Form Dialog Components
 * 
 * Barrel export for all ContactFormDialog sub-components.
 * Use this file to import components from the ContactFormDialog directory.
 * 
 * @example
 * // Import container component
 * import { ContactFormDialog } from '@/features/contacts/components/ContactFormDialog';
 * 
 * // Import specific presentational component
 * import { ContactFormMainFields } from '@/features/contacts/components/ContactFormDialog/ContactFormMainFields';
 */

// Container component (default export)
export { default, ContactFormDialog } from './ContactFormDialog';

// Presentational components
export { ContactFormHeader } from './ContactFormHeader';
export { ContactFormMainFields } from './ContactFormMainFields';
export { ContactFormAccountSearch, } from './ContactFormAccountSearch';
export { ContactFormUserSearch,  } from './ContactFormUserSearch';
export { ContactFormContactInfo } from './ContactFormContactInfo';
export { ContactFormAdditionalInfo } from './ContactFormAdditionalInfo';
export { ContactFormActions } from './ContactFormActions';