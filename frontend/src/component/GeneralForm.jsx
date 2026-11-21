import { Controller } from "react-hook-form";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";
import SearchableSelect from "@/component/SearchableSelect";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GeneralForm({ form, fields, onSubmit, children }) {
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full min-w-0"
    >
      <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((fieldConfig) => (
          <Controller
            key={fieldConfig.name}
            name={fieldConfig.name}
            control={form.control}

            //this function is provided by controller to connect our ui components like input to react hook form
            render={({ field, fieldState }) => (
              // field.value
              // field.onChange
              // field.onBlur
              // field.name
              // field.ref

              // fieldState.error
              // fieldState.invalid
              // fieldState.isTouched

              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  {fieldConfig.label}
                </FieldLabel>

                {/* INPUT */}

                {fieldConfig.type === "input" && (
                  <Input
                    {...field}
                    id={field.name}
                    type={fieldConfig.inputType || "text"}
                    min={fieldConfig.inputType === "number" ? (fieldConfig.min ?? 0) : undefined}
                    step={fieldConfig.inputType === "number" ? (fieldConfig.step ?? "any") : undefined}
                    placeholder={fieldConfig.placeholder}
                    aria-invalid={fieldState.invalid}
                  />
                )}

                {/* TEXTAREA */}

                {fieldConfig.type === "textarea" && (
                  <Textarea
                    {...field}
                    id={field.name}
                    placeholder={fieldConfig.placeholder}
                    aria-invalid={fieldState.invalid}
                  />
                )}

                {/* SELECT */}

                {fieldConfig.type === "searchable-select" && (
                  <SearchableSelect
                    id={field.name}
                    // inputRef lets the form to focus on the actual input
                    inputRef={field.ref}
                    value={field.value ?? ""}
                    onChange={(value) => {
                      field.onChange(value);
                      // Dependent fields (for example a payment's invoice) may
                      // need to reset when their controlling selection changes.
                      fieldConfig.onChange?.(value);
                    }}
                    onBlur={field.onBlur}
                    options={fieldConfig.options}
                    placeholder={fieldConfig.placeholder}
                    clearLabel={fieldConfig.clearLabel}
                    emptyMessage={fieldConfig.emptyMessage}
                    invalid={fieldState.invalid}
                  />
                )}

                {fieldConfig.type === "select" && (
                  <Select
                    items={fieldConfig.options}
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      field.onChange(value);
                      fieldConfig.onChange?.(value);
                    }}
                    disabled={fieldConfig.disabled}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder={fieldConfig.placeholder} />
                    </SelectTrigger>

                    <SelectContent>
                      {fieldConfig.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* DESCRIPTION */}

                {fieldConfig.description && (
                  <FieldDescription>{fieldConfig.description}</FieldDescription>
                )}

                {/* ERROR */}

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        ))}
      </FieldGroup>
      {children}
    </form>
  );
}
