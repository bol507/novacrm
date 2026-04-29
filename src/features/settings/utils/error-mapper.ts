import type { FieldPath, UseFormReturn } from "react-hook-form";


export function mapBackendErrors<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  error: any
) {
  if (!error?.response?.data?.errors) return;

  const backendErrors = error.response.data.errors;
  
  Object.entries(backendErrors).forEach(([field, messages]) => {

    const formField = field.replace(/_(\w)/g, (_, c) => c.toUpperCase()); // snake_case → camelCase
    if(formField in form.getValues()) {
        form.setError(formField as FieldPath<T>, {
            type: 'backend',
            message: Array.isArray(messages) ? messages[0] : String(messages),
        });
    }

   
  });
}