export default function HeaderBar({ createLabel, onCreate, children }) {
  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <div className="d-flex gap-2">
        {children}
        {createLabel && onCreate && (
          <button className="btn btn-primary" onClick={onCreate}>
            <i className="bi bi-plus-lg me-1"></i>{createLabel}
          </button>
        )}
      </div>
    </div>
  );
}
