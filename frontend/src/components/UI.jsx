import { useEffect, useId, useRef } from 'react'
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'

export function ModalConfirmacion({ title, subtitle, children, onClose, className = '' }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement
    const focusable = () => [
      ...(dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || []),
    ]
    requestAnimationFrame(() => focusable()[0]?.focus())
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) return
      const first = items[0],
        last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('modal-open')
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.classList.remove('modal-open')
      previousFocus?.focus?.()
    }
  }, [])
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <section
        ref={dialogRef}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="modal-close-controls">
          <kbd title="Atajo de teclado">Esc</kbd>
          <button
            className="icon-button close"
            type="button"
            aria-label="Cerrar ventana"
            title="Cerrar ventana (Esc)"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        <header>
          <h2 id={titleId}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </header>
        {children}
      </section>
    </div>
  )
}
export function CardIndicador({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <article className={`metric ${tone}`}>
      <div className="metric-icon">
        <Icon />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  )
}
export function TableList({ columns, rows, empty = 'No hay registros.', className = '' }) {
  return (
    <div className={`table-wrap ${className}`}>
      <table>
        <thead>
          <tr>
            {columns.map((x) => (
              <th key={x.key}>{x.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map((x) => (
                  <td key={x.key}>{x.render ? x.render(row) : row[x.key]}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="empty">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
export function Estado({ value }) {
  return <span className={`status ${value.toLowerCase()}`}>{value}</span>
}

export function ListFilters({ search, onSearch, placeholder = 'Buscar…', filters = [] }) {
  return (
    <div className="list-filters" aria-label="Filtros del listado">
      <label className="list-search">
        <Search />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </label>
      <div className="list-filter-selects">
        <SlidersHorizontal />
        {filters.map((filter) => (
          <label key={filter.key}>
            <span>{filter.label}</span>
            <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
              {filter.options.map((option) => {
                const value = typeof option === 'string' ? option : option.value
                const label = typeof option === 'string' ? option : option.label
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                )
              })}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}

export function Pagination({ page, total, pageSize, onChange, itemLabel = 'registros' }) {
  const pages = Math.max(1, Math.ceil(total / pageSize)),
    safePage = Math.min(page, pages),
    start = total ? (safePage - 1) * pageSize + 1 : 0,
    end = Math.min(safePage * pageSize, total)
  return (
    <div className="pagination" aria-label="Paginación">
      <span>
        Mostrando{' '}
        <strong>
          {start}–{end}
        </strong>{' '}
        de <strong>{total}</strong> {itemLabel}
      </span>
      <div>
        <button
          type="button"
          onClick={() => onChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Página anterior"
          title="Página anterior"
        >
          <ChevronLeft />
        </button>
        <em>
          Página {safePage} de {pages}
        </em>
        <button
          type="button"
          onClick={() => onChange(safePage + 1)}
          disabled={safePage >= pages}
          aria-label="Página siguiente"
          title="Página siguiente"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
}
