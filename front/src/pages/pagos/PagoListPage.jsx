import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePagos from '../../hooks/usePagos';
import DataTable from '../../components/ui/DataTable';

// Página de listado de pagos registrados
// Ruta: /pagos
// Acceso: Administradores y personal de cobros
export default function PagoListPage() {
  const navigate = useNavigate();
  const { getPagos, confirmarPago, loading } = usePagos();
  const [pagos, setPagos] = useState([]);          // Lista de pagos obtenidos de la API
  const [pagination, setPagination] = useState(null); // Datos de paginación (total, por página, etc.)
  const [page, setPage] = useState(1);              // Página actual del listado

  // Carga los pagos según la página actual
  const load = useCallback(async () => {
    try {
      const data = await getPagos(page);
      if (data) {
        setPagos(data.data || data.pagos || data);
        setPagination(data.pagination || data.meta || null);
      }
    } catch (err) {
      toast.error(err.message);
    }
  }, [getPagos, page]);

  // Recarga cuando cambia la página
  useEffect(() => {
    load();
  }, [load]);

  // Confirma un pago pendiente: muestra confirmación, llama a la API y recarga
  const handleConfirmar = async (row) => {
    if (!window.confirm(`¿Confirmar pago de Bs. ${row.monto}?`)) return;
    try {
      await confirmarPago(row.id);
      toast.success('Pago confirmado correctamente');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Configuración de columnas de la tabla de pagos
  const columns = [
    { key: 'numero_recibo', label: 'Recibo', render: (row) => row.numero_recibo || row.id || '-' },
    {
      key: 'postulante', label: 'Postulante',
      render: (row) => {
        const nombre = row.postulante_nombre || row.postulante?.nombre || '';
        const apellido = row.postulante_apellido || row.postulante?.apellido || '';
        return `${nombre} ${apellido}`.trim() || '-';
      },
    },
    {
      key: 'monto', label: 'Monto',
      render: (row) => `Bs. ${row.monto || 0}`,
    },
    {
      key: 'metodo_pago', label: 'Método',
      render: (row) => {
        const map = {
          efectivo: 'Efectivo',
          transferencia: 'Transferencia',
          tarjeta: 'Tarjeta',
          qr: 'QR',
          pasarela: 'Pasarela',
        };
        return map[row.metodo_pago] || row.metodo_pago || '-';
      },
    },
    {
      key: 'estado', label: 'Estado',
      // Muestra el estado con un badge de color: pendiente (amarillo), confirmado (verde), rechazado (rojo)
      render: (row) => {
        const map = { pendiente: 'warning', confirmado: 'success', rechazado: 'danger' };
        return <span className={`badge bg-${map[row.estado] || 'secondary'}`}>{row.estado || '-'}</span>;
      },
    },
    {
      key: 'fecha', label: 'Fecha',
      render: (row) => row.fecha || row.created_at || '-',
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Pagos</h4>
        <button className="btn btn-primary" onClick={() => navigate('/pagos/nuevo')}>
          <i className="bi bi-plus-lg me-1"></i>Nuevo Pago
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={pagos}
            loading={loading}
            onEdit={(row) => row.estado === 'pendiente' ? handleConfirmar(row) : null}
          />
        </div>
      </div>

      {/* Controles de paginación */}
      {pagination && (
        <nav className="mt-3">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
            </li>
            {Array.from({ length: Math.ceil((pagination.total || 1) / (pagination.per_page || 10)) }, (_, i) => (
              <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${page >= Math.ceil((pagination.total || 1) / (pagination.per_page || 10)) ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage((p) => p + 1)}>Siguiente</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
