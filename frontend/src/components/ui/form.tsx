import * as React from 'react';
import { Controller, ControllerProps, FieldPath, FieldValues, UseFormReturn, FormProvider } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from './label';

interface FormProps<T extends FieldValues> extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<T>;
  onSubmit?: (data: T) => void;
}

const Form = <T extends FieldValues>({ form, onSubmit, className, children, ...props }: FormProps<T>) => {
  const handleSubmit = form.handleSubmit((data: T) => {
    onSubmit?.(data);
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={cn('space-y-4', className)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
};
Form.displayName = 'Form';

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props} />
  )
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <Label ref={ref} className={cn('', className)} {...props} />
));
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    children?: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  if (!children) {
    return null;
  }

  return (
    <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props}>
      {children}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = ControllerProps<TFieldValues, TName>;

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: FormFieldProps<TFieldValues, TName>) => {
  return <Controller {...props} />;
};

export { Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };

