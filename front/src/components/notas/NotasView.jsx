import { useState, useEffect, useRef, useMemo } from 'react'
import useGrupos from '../../hooks/useGrupos'
import useExamenes from '../../hooks/useExamenes'
import useRindes from '../../hooks/useRindes'
import usePostulaciones from '../../hooks/usePostulaciones'
import useCatalogos from '../../hooks/useCatalogos'
import useCargarRindes from '../../hooks/useCargarRindes'
import StudentRindesTable from './StudentRindesTable'
import TablaNotas from './TablaNotas'
import EditarNotaModal from './EditarNotaModal'
import { toast } from 'sonner'

export default function NotasView ({ grupoSelectWidth, renderGrupoOption }) {
  const { getGrupos, getGrupo } = useGrupos()
  const { getExamenes, getExamenRindes } = useExamenes()
  const { storeRinde, updateRinde, getRindesByPostulacion } = useRindes()
  const { getPostulaciones } = usePostulaciones()
  const { getMaterias } = useCatalogos()
  const [materias, setMaterias] = useState([])
  const [grupos, setGrupos] = useState([])
  const [examenes, setExamenes] = useState([])
  const [selectedMateria, setSelectedMateria] = useState('')
  const [selectedTurno, setSelectedTurno] = useState('')
  const [selectedGrupo, setSelectedGrupo] = useState('')
  const [selectedExamen, setSelectedExamen] = useState('')
  const [estudiantes, setEstudiantes] = useState([])
  const { notas, setNotas, rindesIds, setRindesIds } = useCargarRindes(selectedExamen, getExamenRindes)
  const [busqueda, setBusqueda] = useState('')
  const [resultadosBusqueda, setResultadosBusqueda] = useState([])
  const [buscando, setBuscando] = useState(false)
  const [filtroSinNota, setFiltroSinNota] = useState(false)
  const [selectedPostulacion, setSelectedPostulacion] = useState(null)
  const [studentRindes, setStudentRindes] = useState([])
  const [loadingStudent, setLoadingStudent] = useState(false)
  const searchRef = useRef(null)
  const [modalRinde, setModalRinde] = useState(null)
  const [modalNotaValue, setModalNotaValue] = useState('')
  const [savingModal, setSavingModal] = useState(false)

  useEffect(() => {
    (async () => {
      const d = await getMaterias()
      setMaterias(d || [])
    })()
  }, [getMaterias])

  const gruposFiltrados = useMemo(() => {
    let gs = grupos
    if (selectedTurno) gs = gs.filter((g) => String(g.turno_id) === String(selectedTurno))
    return gs
  }, [grupos, selectedTurno])

  const turnosGrupo = useMemo(() => {
    const map = {}
    grupos.forEach((g) => { if (g.turno) map[g.turno.id] = g.turno })
    return Object.values(map)
  }, [grupos])

  const gruposStudent = useMemo(() => {
    if (!studentRindes.length) return []
    let r = studentRindes
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria))
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno))
    const map = {}
    r.forEach((x) => { if (x.examen?.grupo) map[x.examen.grupo.id] = x.examen.grupo })
    return Object.values(map)
  }, [studentRindes, selectedMateria, selectedTurno])

  const turnosStudent = useMemo(() => {
    if (!studentRindes.length) return []
    let r = studentRindes
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria))
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo))
    const map = {}
    r.forEach((x) => { if (x.examen?.grupo?.turno) map[x.examen.grupo.turno.id] = x.examen.grupo.turno })
    return Object.values(map)
  }, [studentRindes, selectedMateria, selectedGrupo])

  const examenesStudent = useMemo(() => {
    if (!studentRindes.length) return []
    let r = studentRindes
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria))
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo))
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno))
    const map = {}
    r.forEach((x) => { if (x.examen) map[x.examen.id] = x.examen })
    return Object.values(map)
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno])

  const studentRindesFiltrados = useMemo(() => {
    if (!studentRindes.length) return []
    let r = studentRindes
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria))
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo))
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno))
    if (selectedExamen) r = r.filter((x) => String(x.examen_id) === String(selectedExamen))
    return r
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno, selectedExamen])

  const promedioFiltrado = useMemo(() => {
    if (studentRindesFiltrados.length === 0) return null
    const sum = studentRindesFiltrados.reduce((acc, r) => acc + (Number(r.nota) || 0), 0)
    return sum / studentRindesFiltrados.length
  }, [studentRindesFiltrados])

  const rindesPorMateria = useMemo(() => {
    if (selectedMateria || studentRindesFiltrados.length === 0) return null
    const grupos = {}
    studentRindesFiltrados.forEach((r) => {
      const nombre = r.examen?.grupo?.materia?.nombre || 'Sin materia'
      if (!grupos[nombre]) grupos[nombre] = []
      grupos[nombre].push(r)
    })
    return Object.entries(grupos).map(([nombre, rindes]) => {
      const sum = rindes.reduce((acc, r) => acc + (Number(r.nota) || 0), 0)
      return { nombre, rindes, promedio: sum / rindes.length }
    })
  }, [studentRindesFiltrados, selectedMateria])

  const handleMateriaChange = async (id) => {
    setSelectedMateria(id)
    setSelectedTurno('')
    if (selectedPostulacion) return
    setSelectedGrupo(''); setSelectedExamen(''); setEstudiantes([]); setNotas({})
    setGrupos([])
    if (!id) return
    try {
      const d = await getGrupos(1, { materia_id: id, per_page: 200 })
      if (d) setGrupos(d.data || d.grupos || [])
    } catch (err) { toast.error(err.message) }
  }

  const handleTurnoChange = (id) => {
    setSelectedTurno(id)
  }

  const handleGrupoChange = async (grupoId) => {
    setSelectedGrupo(grupoId)
    if (selectedPostulacion) {
      setSelectedExamen(''); setEstudiantes([]); setNotas({})
      return
    }
    setSelectedPostulacion(null)
    setStudentRindes([])
    setSelectedExamen(''); setEstudiantes([]); setNotas({})
    if (!grupoId) return
    try {
      const [examenesData, grupo] = await Promise.all([
        getExamenes(1, grupoId),
        getGrupo(grupoId)
      ])
      setExamenes(examenesData?.data || [])
      setEstudiantes((grupo?.postulacion_grupos || []).map((pg) => pg.postulacion))
      if (grupo?.turno_id) setSelectedTurno(String(grupo.turno_id))
    } catch (err) { toast.error(err.message) }
  }

  const handleLimpiar = () => {
    setBusqueda('')
    setResultadosBusqueda([])
    setSelectedPostulacion(null)
    setStudentRindes([])
    setSelectedMateria('')
    setSelectedTurno('')
    setSelectedGrupo('')
    setSelectedExamen('')
    setEstudiantes([])
    setNotas({})
    setGrupos([])
  }

  const estudiantesFiltrados = filtroSinNota
    ? estudiantes.filter((e) => notas[e.id] == null)
    : estudiantes

  const handleBuscar = async () => {
    if (!busqueda.trim()) return
    setBuscando(true)
    try {
      const res = await getPostulaciones(1, { search: busqueda })
      setResultadosBusqueda(res?.data || [])
    } catch (err) { toast.error(err.message) } finally { setBuscando(false) }
  }

  const handleSeleccionarEstudiante = async (postulacion) => {
    const nombre = `${postulacion.postulante?.persona?.nombre || ''} ${postulacion.postulante?.persona?.apellido || ''}`.trim()
    setResultadosBusqueda([])
    setBusqueda(nombre || postulacion.postulante?.persona?.ci || '')
    setSelectedPostulacion(postulacion)
    setSelectedGrupo('')
    setSelectedExamen('')
    setEstudiantes([])
    setNotas({})
    setLoadingStudent(true)
    try {
      const data = await getRindesByPostulacion(postulacion.id)
      setStudentRindes(data?.rindes || [])
    } catch (err) { toast.error(err.message) } finally { setLoadingStudent(false) }
  }

  const handleEditStart = (rindeOrPost) => {
    if (selectedPostulacion) {
      setModalRinde(rindeOrPost)
      setModalNotaValue(rindeOrPost.nota ?? '')
    } else {
      const grupo = grupos.find(g => String(g.id) === String(selectedGrupo))
      const examen = examenes.find(e => String(e.id) === String(selectedExamen))
      setModalRinde({
        id: rindesIds[rindeOrPost.id],
        postulacion_id: rindeOrPost.id,
        nota: notas[rindeOrPost.id] ?? '',
        examen: {
          nro: examen?.nro,
          grupo: grupo
            ? {
                codigo: grupo?.codigo,
                materia: grupo?.materia || { nombre: '' }
              }
            : null
        }
      })
      setModalNotaValue(notas[rindeOrPost.id] ?? '')
    }
  }

  const handleModalSave = async () => {
    if (!modalRinde) return
    setSavingModal(true)
    try {
      const notaVal = Number(modalNotaValue)
      let saved = false
      if (modalRinde.id) {
        await updateRinde(modalRinde.id, { nota: notaVal })
        saved = true
      } else if (selectedExamen) {
        await storeRinde({ postulacion_id: modalRinde.postulacion_id, examen_id: Number(selectedExamen), nota: notaVal })
        saved = true
      }
      setModalRinde(null)
      if (saved) {
        toast.success('Nota actualizada correctamente')
        if (selectedPostulacion) {
          const data = await getRindesByPostulacion(selectedPostulacion.id)
          setStudentRindes(data?.rindes || [])
        } else if (selectedExamen) {
          const exam = await getExamenRindes(selectedExamen)
          if (exam) {
            const m1 = {}; const m2 = {};
            (exam.rindes || []).forEach((r) => { m1[r.postulacion_id] = r.nota; m2[r.postulacion_id] = r.id })
            setNotas(m1)
            setRindesIds(m2)
          }
        }
      } else {
        toast.error('Seleccione un examen para registrar la nota')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingModal(false)
    }
  }

  const handleModalClose = () => {
    setModalRinde(null)
    setModalNotaValue('')
  }

  const turnosDisponibles = selectedPostulacion ? turnosStudent : turnosGrupo

  const filterSelectStyle = (width) => ({ width })

  return (
    <div>
      <div className='d-flex flex-wrap gap-2 mb-2'>
        <div className='input-group' style={{ minWidth: 250 }} ref={searchRef}>
          <input
            type='text' className='form-control form-control-sm' placeholder='Agregar Alumno — CI, nombre o apellido...'
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          />
          <button className='btn btn-sm btn-outline-primary' onClick={handleBuscar} disabled={buscando}>
            {buscando ? <span className='spinner-border spinner-border-sm' /> : <i className='bi bi-search' />}
          </button>
          <button className='btn btn-sm btn-outline-secondary' onClick={handleLimpiar} title='Limpiar filtros'>
            <i className='bi bi-x-lg' />
          </button>
        </div>
        <select className='form-select form-select-sm' style={filterSelectStyle(220)} value={selectedMateria || ''} onChange={(e) => handleMateriaChange(e.target.value)}>
          <option value=''>{selectedMateria ? 'Quitar filtro' : 'Materia'}</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <select
          className='form-select form-select-sm' style={filterSelectStyle(grupoSelectWidth)} value={selectedGrupo || ''} onChange={(e) => handleGrupoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || gruposFiltrados.length === 0)}
        >
          <option value=''>{selectedGrupo ? 'Quitar filtro' : 'Grupo'}</option>
          {selectedPostulacion
            ? gruposStudent.map((g) => (
              <option key={g.id} value={g.id}>{renderGrupoOption(g)}</option>
            ))
            : gruposFiltrados.map((g) => (
              <option key={g.id} value={g.id}>{renderGrupoOption(g)}</option>
            ))}
        </select>
        <select
          className='form-select form-select-sm' style={filterSelectStyle(160)} value={selectedTurno || ''} onChange={(e) => handleTurnoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || turnosDisponibles.length === 0)}
        >
          <option value=''>{selectedTurno ? 'Quitar filtro' : 'Turno'}</option>
          {turnosDisponibles.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <select
          className='form-select form-select-sm' style={filterSelectStyle(320)} value={selectedExamen || ''} onChange={(e) => setSelectedExamen(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || examenes.length === 0)}
        >
          <option value=''>{selectedExamen ? 'Quitar filtro' : 'Examen'}</option>
          {selectedPostulacion
            ? examenesStudent.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || 'Examen #' + e.nro}</option>
            ))
            : examenes.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || ('Examen #' + e.nro)} ({e.fecha ? new Date(e.fecha).toLocaleDateString() : ''}) - {e.porcentaje}%</option>
            ))}
        </select>
      </div>
      {resultadosBusqueda.length > 0 && (
        <ul className='list-group mb-2' style={{ maxHeight: 200, overflowY: 'auto' }}>
          {resultadosBusqueda.map((p) => (
            <li key={p.id} className='list-group-item list-group-item-action py-1' role='button' onClick={() => handleSeleccionarEstudiante(p)} style={{ cursor: 'pointer' }}>
              <small>{p.postulante?.persona?.ci} - {p.postulante?.persona?.nombre} {p.postulante?.persona?.apellido}</small>
            </li>
          ))}
        </ul>
      )}
      {(selectedPostulacion || selectedGrupo)
        ? (
          <>
            {selectedGrupo && selectedExamen && (
              <div className='d-flex justify-content-end mb-2'>
                <div className='form-check form-switch'>
                  <input
                    className='form-check-input' type='checkbox' id='filtroSinNota'
                    checked={filtroSinNota} onChange={(e) => setFiltroSinNota(e.target.checked)}
                  />
                  <label className='form-check-label small' htmlFor='filtroSinNota'>Solo sin nota</label>
                </div>
              </div>
            )}
            {selectedPostulacion
              ? (
                <StudentRindesTable
                  studentRindesFiltrados={studentRindesFiltrados}
                  selectedMateria={selectedMateria}
                  rindesPorMateria={rindesPorMateria}
                  promedioFiltrado={promedioFiltrado}
                  handleEditStart={handleEditStart}
                  loadingStudent={loadingStudent}
                />
                )
              : (
                <TablaNotas estudiantes={estudiantesFiltrados} notas={notas} onEditNota={handleEditStart} onSeleccionarEstudiante={handleSeleccionarEstudiante} />
                )}
          </>
          )
        : (
          <div className='alert alert-secondary'>Seleccione un grupo o busque un estudiante.</div>
          )}
      <EditarNotaModal
        show={!!modalRinde} rinde={modalRinde}
        value={modalNotaValue} onChange={setModalNotaValue}
        onSave={handleModalSave} onClose={handleModalClose} saving={savingModal}
      />
    </div>
  )
}
