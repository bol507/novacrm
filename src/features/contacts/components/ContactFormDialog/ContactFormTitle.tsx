/**
 * ContactFormTitle Component for page-based forms.
 *
 * Presentational component that renders the page title
 * without Dialog wrapper - for use in dedicated pages.
 *
 * @component
 * @param props - Component props
 * @param props.mode - Form mode ('create' or 'edit')
 * @returns The rendered page title section
 *
 * @example
 * // Create mode
 * <ContactFormTitle mode="create" />
 *
 * @example
 * // Edit mode
 * <ContactFormTitle mode="edit" />
 */
export const ContactFormTitle = ({ mode }: { mode: 'create' | 'edit' }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-foreground">
        {mode === 'edit' ? 'Edit Contact' : 'New Contact'}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        {mode === 'edit' 
          ? 'Update contact information below' 
          : 'Fill in the contact details below'}
      </p>
    </div>
  );
};

export default ContactFormTitle;