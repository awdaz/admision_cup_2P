// Componente de alerta descartable con auto-cierre después de 5 segundos
import { useState, useEffect } from 'react';

export default function Alert({ type = 'info', message, onClose }) {
  const [visible, setVisible] = useState(true); // Controla si la alerta está visible

  // Auto-cierra la alerta tras 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`alert alert-${type} alert-dismissible fade show`} role="alert">
      {message}
      {/* Botón manual para cerrar la alerta */}
      <button
        type="button"
        className="btn-close"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      ></button>
    </div>
  );
}
