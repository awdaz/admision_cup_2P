import { useState } from 'react'

export default function SearchBar ({ value: externalValue, onChange, onSearch, placeholder = 'Buscar...', buttonLabel, className = '' }) {
  const [internalValue, setInternalValue] = useState('')
  const isControlled = externalValue !== undefined
  const value = isControlled ? externalValue : internalValue
  const setValue = isControlled ? onChange : setInternalValue

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(value)
  }

  return (
    <form className={`input-group${className ? ' ' + className : ''}`} onSubmit={handleSubmit}>
      <input
        className='form-control'
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e)}
      />
      <button className='btn btn-outline-secondary' type='submit'>
        <i className='bi bi-search' />
        {buttonLabel && <span className='ms-1'>{buttonLabel}</span>}
      </button>
    </form>
  )
}
