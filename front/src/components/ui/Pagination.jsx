import { useMemo } from 'react'

export default function Pagination ({ page, totalPages, setPage, simple }) {
  const visiblePages = useMemo(() => {
    if (!totalPages || totalPages <= 1) return null
    if (simple) return null
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages, start + maxVisible - 1)
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    const pages = []
    for (let i = start; i <= end; i++) pages.push(i)
    return { start, end, pages }
  }, [page, totalPages, simple])

  if (!totalPages || totalPages <= 1) return null

  if (simple) {
    return (
      <nav className='mt-3'>
        <ul className='pagination justify-content-center'>
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button className='page-link' onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          </li>
          {Array.from({ length: totalPages }, (_, i) => (
            <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
              <button className='page-link' onClick={() => setPage(i + 1)}>{i + 1}</button>
            </li>
          ))}
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button className='page-link' onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </li>
        </ul>
      </nav>
    )
  }

  return (
    <nav className='mt-3' aria-label='Navegación de páginas'>
      <ul className='pagination justify-content-center flex-wrap mb-0'>
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className='page-link' onClick={() => setPage(1)} aria-label='Primera página'>
            <i className='bi bi-chevron-double-left' />
          </button>
        </li>
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button className='page-link' onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
        </li>

        {visiblePages.start > 1 && (
          <>
            <li className='page-item'>
              <button className='page-link' onClick={() => setPage(1)}>1</button>
            </li>
            {visiblePages.start > 2 && (
              <li className='page-item disabled'>
                <span className='page-link'>...</span>
              </li>
            )}
          </>
        )}

        {visiblePages.pages.map((i) => (
          <li key={i} className={`page-item ${page === i ? 'active' : ''}`}>
            <button className='page-link' onClick={() => setPage(i)}>{i}</button>
          </li>
        ))}

        {visiblePages.end < totalPages && (
          <>
            {visiblePages.end < totalPages - 1 && (
              <li className='page-item disabled'>
                <span className='page-link'>...</span>
              </li>
            )}
            <li className='page-item'>
              <button className='page-link' onClick={() => setPage(totalPages)}>{totalPages}</button>
            </li>
          </>
        )}

        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button className='page-link' onClick={() => setPage((p) => p + 1)}>Siguiente</button>
        </li>
        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <button className='page-link' onClick={() => setPage(totalPages)} aria-label='Última página'>
            <i className='bi bi-chevron-double-right' />
          </button>
        </li>
      </ul>
    </nav>
  )
}
