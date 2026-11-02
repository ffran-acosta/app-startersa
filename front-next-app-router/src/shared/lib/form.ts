export type FormState = {
  message?: string
  errors?: Partial<Record<string, string[]>>
  /** Lo que se envió, para no perderlo cuando React resetea el form tras la action. */
  values?: Partial<Record<string, string>>
}

export function readForm<const Field extends string>(
  formData: FormData,
  fields: readonly Field[],
) {
  return Object.fromEntries(
    fields.map((field) => [field, String(formData.get(field) ?? '')]),
  ) as Record<Field, string>
}
