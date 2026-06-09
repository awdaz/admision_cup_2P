export default function FormPageLayout({ children, maxWidth = 'lg-8' }) {
  return (
    <div className="row justify-content-center">
      <div className={`col-${maxWidth}`}>
        <div className="card shadow-sm">
          <div className="card-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
