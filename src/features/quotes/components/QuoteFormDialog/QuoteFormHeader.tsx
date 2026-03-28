/**
 * Props for QuoteFormHeader component
 */
export interface QuoteFormHeaderProps {
   /** Form mode: 'create' for new quote, 'edit' for existing */
  mode: 'create' | 'edit';
  /** Optional: custom title override */
  title?: string;
}

/**
 * QuoteFormHeader Component
 * 
 * Displays the form title based on form mode.
 * Works in both Dialog and Page contexts.
 * 
 * @component
 */
export const QuoteFormHeader = ({ mode, title }: QuoteFormHeaderProps) => {
  const defaultTitle = mode === 'edit' ? 'Editar Cotización' : 'Nueva Cotización';
  const displayTitle = title || defaultTitle;

  return (
    <div className="pb-4 border-b">
      <h2 className="text-xl font-bold text-foreground">
        {displayTitle}
      </h2>
      <p className="text-sm text-muted-foreground mt-1">
        {mode === 'edit' 
          ? 'Modifica los detalles de la cotización existente' 
          : 'Completa la información para crear una nueva cotización'}
      </p>
    </div>
  );
};