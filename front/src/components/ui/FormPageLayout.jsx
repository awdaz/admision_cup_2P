export default function FormPageLayout({ title, children, maxWidth = 'lg-8' }) {
  return (
    <div className="row justify-content-center">
      <div className={`col-${maxWidth}`}>
        <h4 className="mb-4">{title}</h4>
        <div className="card shadow-sm">
          <div className="card-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
