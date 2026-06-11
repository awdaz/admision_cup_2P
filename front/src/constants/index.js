export const ESTADOS = Object.freeze({
  POSTULACION: Object.freeze({
    PENDIENTE: Symbol('pendiente'),
    INSCRITO: Symbol('inscrito'),
    ADMITIDO: Symbol('admitido'),
    RECHAZADO: Symbol('rechazado'),
    CANCELADO: Symbol('cancelado')
  }),
  PAGO: Object.freeze({
    PENDIENTE: Symbol('pendiente'),
    CONFIRMADO: Symbol('confirmado'),
    RECHAZADO: Symbol('rechazado')
  }),
  ADMISION: Object.freeze({
    ACTIVO: Symbol('activo'),
    FINALIZADA: Symbol('finalizada')
  })
})

export const ROLES = Object.freeze({
  ADMIN: Symbol('admin'),
  DOCENTE: Symbol('docente'),
  POSTULANTE: Symbol('postulante')
})

export const SEXO = Object.freeze({
  MASCULINO: Symbol('Masculino'),
  FEMENINO: Symbol('Femenino'),
  OTRO: Symbol('Otro'),
  M: Symbol('M'),
  F: Symbol('F')
})

export const DIAS_SEMANA = Object.freeze([
  Symbol('Lunes'),
  Symbol('Martes'),
  Symbol('Miércoles'),
  Symbol('Jueves'),
  Symbol('Viernes'),
  Symbol('Sábado'),
  Symbol('Domingo')
])

export const METODOS_PAGO = Object.freeze({
  PASARELA: Symbol('pasarela')
})

export const APROBACION = Object.freeze({
  APROBADO: Symbol('aprobado'),
  REPROBADO: Symbol('reprobado')
})

export const ACTIVO = Object.freeze({
  ACTIVO: Symbol('activo'),
  INACTIVO: Symbol('inactivo')
})

export const SI_NO = Object.freeze({
  SI: Symbol('Sí'),
  NO: Symbol('No')
})

export const TECLA = Object.freeze({
  ENTER: Symbol('Enter')
})

export const ALMACENAMIENTO = Object.freeze({
  TOKEN: Symbol('token'),
  USUARIO: Symbol('user')
})

export const CABECERA_HTTP = Object.freeze({
  AUTHORIZATION: Symbol('Authorization'),
  CONTENT_TYPE: Symbol('Content-Type'),
  BEARER: Symbol('Bearer'),
  JSON: Symbol('application/json')
})

export const ERROR_API = Object.freeze({
  SESION_EXPIRADA: Symbol('Sesión expirada'),
  FETCH_FALLIDO: Symbol('Failed to fetch'),
  TYPE_ERROR: Symbol('TypeError')
})

/** Retorna el string description del Symbol, o el mismo valor si no es Symbol */
export function str (sym) {
  return sym?.description ?? sym
}
