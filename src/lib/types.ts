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
}

export interface YearData {
  ano: number;
  edad: number;
  capitalCaja: number;
  capitalReserva: number;
  capitalTotal: number;
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
}

export interface AccumulationResult {
  capitalCajaFinal: number;
  capitalReservaFinal: number;
  capitalTotalFinal: number;
  datosAnuales: YearData[];
  aportesOmitidos: number;
  aportesRealizados: number;
}

export interface RetirementResult {
  capitalFinal: number;
  anosCubiertos: number;
  datosAnuales: YearData[];
  esSuficiente: boolean;
}

export interface FullSimulationResult {
  acumulacion: AccumulationResult;
  retiro: RetirementResult;
  ingresoPerpetuoMensual: number;
  estado: 'excelente' | 'alcanzable' | 'insuficiente';
  tablaAnual: YearData[];
}
