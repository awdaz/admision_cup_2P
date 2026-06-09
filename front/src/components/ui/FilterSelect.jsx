export default function FilterSelect({ label, value, onChange, options, allLabel = 'Todos', disabled, optionKey = 'id', optionLabel = 'nombre', mapOption, ...props }) {
  return (
    <select className="form-select" value={value || ''} onChange={onChange} disabled={disabled} {...props}>
      <option value="">{allLabel || 'Todos'}</option>
      {(options || []).map((opt) => {
        const val = typeof opt === 'object' ? opt[optionKey] : opt;
        const lbl = mapOption ? mapOption(opt) : (typeof opt === 'object' ? opt[optionLabel] : opt);
        return <option key={val} value={val}>{lbl}</option>;
      })}
    </select>
  );
}
