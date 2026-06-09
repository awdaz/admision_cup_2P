import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import usePagos from '../../hooks/usePagos';
import useList from '../../hooks/useList';
import DataTable from '../../components/ui/DataTable';
import HeaderBar from '../../components/ui/HeaderBar';
import Pagination from '../../components/ui/Pagination';

export default function PagoListPage() {
  const navigate = useNavigate();
  const { getPagos, confirmarPago, loading: loadingHook } = usePagos();

  const { items: pagos, pagination, page, setPage, loading, load } = useList(
    (p) => getPagos(p),
    []
  );

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 10)),
    [pagination]
  );

  const handleConfirmar = async (row) => {
    if (!window.confirm(`¿Confirmar pago de Bs. ${row.monto}?`)) return;
    try {
      await confirmarPago(row.id);
      toast.success('Pago confirmado correctamente');
      load(page);
    } catch (err) {
      toast.error(err.message);
    }
  };

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
      <HeaderBar createLabel="Nuevo Pago" onCreate={() => navigate('/pagos/nuevo')} />

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <DataTable
            columns={columns}
            data={pagos}
            loading={loading || loadingHook}
            onEdit={(row) => row.estado === 'pendiente' ? handleConfirmar(row) : null}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} simple />
    </div>
  );
}
