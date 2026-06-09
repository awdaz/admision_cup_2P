import { useNavigate } from 'react-router-dom';

export default function CancelButton({ to, label = 'Cancelar', className = 'btn btn-secondary', ...props }) {
  const navigate = useNavigate();
  return (
    <button type="button" className={className} onClick={() => navigate(to || -1)} {...props}>
      {label}
    </button>
  );
}
