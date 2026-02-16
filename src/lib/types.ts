export interface CalculatorInputs {
  edadActual: number;
  edadJubilacion: number;
  esperanzaVida: number;
  capitalInicialCaja: number;
  capitalInicialReserva: number;
  ingresoMensual: number;
  gastoMensual: number;
  aporteMensualJubilacion: number;
  tasaRetornoCajaAnual: number;
  tasaRetornoReservaAnual: number;
  inflacionAnual: number;
  gastoMensualDeseado: number;
  mesInicio: number;
  anoInicio: number;
  margenSeguridad: number;
}
export interface YearData {
  mes?: number;
  ano: number;
  edad: number;
  capitalCaja: number;
  capitalReserva: number;
  capitalTotal: number;
  capitalTotalStressed?: number;
  ingresosTrabajo?: number;
  gastosMensuales: number;
  gastosAnuales: number;
  gastoMensualAjustado?: number;
  aportes?: number;
  flujoNeto?: number;
  rendimientoCaja: number;
  rendimientoReserva: number;
  rendimientoTotal: number;
  deficitAnual?: number;
  referenciaInflacion: number;
}

export interface AccumulationResult {
  capitalCajaFinal: number;
  capitalReservaFinal: number;
  capitalCajaFinalStressed: number;
  capitalReservaFinalStressed: number;
  capitalTotalFinal: number;
  datosAnuales: YearData[];
  datosMensuales: YearData[];
  aportesOmitidos: number;
  aportesRealizados: number;
  lastMonth: number;
  lastYear: number;
  lastEdad: number;
}

export interface RetirementResult {
  capitalFinal: number;
  anosCubiertos: number;
  datosAnuales: YearData[];
  datosMensuales: YearData[];
  esSuficiente: boolean;
}

export interface FullSimulationResult {
  acumulacion: AccumulationResult;
  retiro: RetirementResult;
  ingresoPerpetuoMensual: number;
  estado: 'excelente' | 'alcanzable' | 'insuficiente';
  tablaAnual: YearData[];
  tablaMensual: YearData[];
}
