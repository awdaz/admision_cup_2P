export default function SubmitButton({ loading, label = 'Guardar', loadingLabel = 'Guardando...', disabled, className = 'btn btn-primary', ...props }) {
  return (
    <button className={className} disabled={disabled || loading} {...props}>
      {loading ? (
        <><span className="spinner-border spinner-border-sm me-2"></span>{loadingLabel}</>
      ) : label}
    </button>
  );
}
