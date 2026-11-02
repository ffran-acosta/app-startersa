import Link from 'next/link'

type PaginationProps = {
  page: number
  totalPages: number
  href: (page: number) => string
}

const linkClassName =
  'rounded-md border border-slate-300 bg-white px-3 py-2 font-medium hover:bg-slate-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

export function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-3 text-sm">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={linkClassName}
      >
        Anterior
      </Link>
      <span>
        {page} / {totalPages}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={linkClassName}
      >
        Siguiente
      </Link>
    </nav>
  )
}
