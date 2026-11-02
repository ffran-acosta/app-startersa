import type { ComponentProps } from 'react'

const fieldClassName =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 aria-invalid:border-red-500'

export function Input(props: ComponentProps<'input'>) {
  return <input className={fieldClassName} {...props} />
}

export function Textarea(props: ComponentProps<'textarea'>) {
  return <textarea className={fieldClassName} rows={4} {...props} />
}

export function Select(props: ComponentProps<'select'>) {
  return <select className={fieldClassName} {...props} />
}
