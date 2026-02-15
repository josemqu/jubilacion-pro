import { CalculatorInputs, AccumulationResult, RetirementResult, YearData, FullSimulationResult } from './types';

export class RetirementCalculator {
  private inputs: CalculatorInputs;
  private tasaDiariaCaja: number;
  private tasaDiariaReserva: number;
  private tasaDiariaInflacion: number;

  constructor(inputs: CalculatorInputs) {
    this.inputs = inputs;
    // We use monthly rates for better alignment with user monthly inputs
    this.tasaDiariaCaja = (inputs.tasaRetornoCajaAnual / 100) / 12;
    this.tasaDiariaReserva = (inputs.tasaRetornoReservaAnual / 100) / 12;
    this.tasaDiariaInflacion = (inputs.inflacionAnual / 100) / 12;
  }

  public simulateAccumulation(): AccumulationResult {
    const anosHastaJubilacion = this.inputs.edadJubilacion - this.inputs.edadActual;
    const diasTotales = anosHastaJubilacion * 365;
    
    let capitalCaja = this.inputs.capitalInicialCaja;
    let capitalReserva = this.inputs.capitalInicialReserva;
    
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    const startYear = this.inputs.anoInicio;

    // Estado inicial (Día 0)
    const initialState: YearData = {
      mes: this.inputs.mesInicio,
      ano: startYear,
      edad: this.inputs.edadActual,
      capitalCaja: Math.round(capitalCaja * 100) / 100,
      capitalReserva: Math.round(capitalReserva * 100) / 100,
      capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
      ingresosTrabajo: 0,
      gastosMensuales: 0,
      gastosAnuales: 0,
      aportes: 0,
      flujoNeto: 0,
      rendimientoCaja: 0,
      rendimientoReserva: 0,
      rendimientoTotal: 0,
      referenciaInflacion: 1.0
    };
    
    datosAnuales.push(initialState);
    datosMensuales.push(initialState);

    let aportesOmitidos = 0;
    let capitalCajaInicioAno = capitalCaja;
    let capitalReservaInicioAno = capitalReserva;
    let ingresosTrabajoAno = 0;
    let gastosAno = 0;
    let aportesAno = 0;
    
    let currentCajaMensual = capitalCaja;
    let currentReservaMensual = capitalReserva;
    let gastosMes = 0;
    let ingresosTrabajoMes = 0;
    let aportesMes = 0;

    let currentMonth = this.inputs.mesInicio;
    let currentYear = this.inputs.anoInicio;
    let currentEdad = this.inputs.edadActual;

    // Calculate total months until retirement age is reached
    let tempMonth = currentMonth;
    let tempEdad = currentEdad;
    let totalMeses = 0;
    while (tempEdad < this.inputs.edadJubilacion) {
      totalMeses++;
      if (tempMonth === 5) tempEdad++;
      tempMonth = (tempMonth + 1) % 12;
    }

    for (let mesIdx = 1; mesIdx <= totalMeses; mesIdx++) {
      // Each iteration is 1 month
      const inflacionAcumulada = Math.pow(1 + this.tasaDiariaInflacion, mesIdx);
      
      const rendCajaMes = capitalCaja * this.tasaDiariaCaja;
      const rendReservaMes = capitalReserva * this.tasaDiariaReserva;
      
      capitalCaja += rendCajaMes;
      capitalReserva += rendReservaMes;

      const ingresoMesAjustado = this.inputs.ingresoMensual * inflacionAcumulada;
      const gastoMesAjustado = this.inputs.gastoMensual * inflacionAcumulada;
      
      capitalCaja += ingresoMesAjustado;
      capitalCaja -= gastoMesAjustado;
      
      if (capitalCaja < 0) capitalCaja = 0;
      
      let aporteRealMensual = 0;
      if (capitalCaja >= this.inputs.aporteMensualJubilacion) {
        capitalCaja -= this.inputs.aporteMensualJubilacion;
        capitalReserva += this.inputs.aporteMensualJubilacion;
        aporteRealMensual = this.inputs.aporteMensualJubilacion;
      } else {
        aportesOmitidos++;
      }

      // Record monthly progress
      datosMensuales.push({
        mes: currentMonth,
        ano: currentYear,
        edad: currentEdad,
        capitalCaja: Math.round(capitalCaja * 100) / 100,
        capitalReserva: Math.round(capitalReserva * 100) / 100,
        capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
        ingresosTrabajo: Math.round(ingresoMesAjustado * 100) / 100,
        gastosMensuales: Math.round(gastoMesAjustado * 100) / 100,
        gastosAnuales: (gastosAno + gastoMesAjustado), // temporary accumulation
        aportes: Math.round(aporteRealMensual * 100) / 100,
        rendimientoCaja: Math.round(rendCajaMes * 100) / 100,
        rendimientoReserva: Math.round(rendReservaMes * 100) / 100,
        rendimientoTotal: Math.round((rendCajaMes + rendReservaMes) * 100) / 100,
        referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
      });

      // Update yearly counters
      ingresosTrabajoAno += ingresoMesAjustado;
      gastosAno += gastoMesAjustado;
      aportesAno += aporteRealMensual;

      // Handle transitions
      if (currentMonth === 5) { // Transition Jun to Jul
        currentEdad++;
      }

      if (currentMonth === 11 || mesIdx === totalMeses) {
        const rendCajaAno = capitalCaja - capitalCajaInicioAno - ingresosTrabajoAno + gastosAno + aportesAno;
        const rendReservaAno = capitalReserva - capitalReservaInicioAno - aportesAno;
        
        datosAnuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.round(capitalCaja * 100) / 100,
          capitalReserva: Math.round(capitalReserva * 100) / 100,
          capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
          ingresosTrabajo: Math.round(ingresosTrabajoAno * 100) / 100,
          gastosMensuales: Math.round((gastosAno / 12) * 100) / 100,
          gastosAnuales: Math.round(gastosAno * 100) / 100,
          aportes: Math.round(aportesAno * 100) / 100,
          flujoNeto: Math.round((ingresosTrabajoAno - gastosAno - aportesAno) * 100) / 100,
          rendimientoCaja: Math.round(rendCajaAno * 100) / 100,
          rendimientoReserva: Math.round(rendReservaAno * 100) / 100,
          rendimientoTotal: Math.round((rendCajaAno + rendReservaAno) * 100) / 100,
          referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
        });

        capitalCajaInicioAno = capitalCaja;
        capitalReservaInicioAno = capitalReserva;
        ingresosTrabajoAno = 0;
        gastosAno = 0;
        aportesAno = 0;
        
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
    }

    return {
      capitalCajaFinal: capitalCaja,
      capitalReservaFinal: capitalReserva,
      capitalTotalFinal: capitalCaja + capitalReserva,
      datosAnuales,
      datosMensuales,
      aportesOmitidos,
      aportesRealizados: totalMeses - aportesOmitidos,
      lastMonth: currentMonth,
      lastYear: currentYear,
      lastEdad: currentEdad
    };
  }

  public simulateRetirement(
    capitalReservaInicial: number,
    capitalCajaInicial: number,
    startMonth: number,
    startYear: number,
    startEdad: number,
    totalMonthsAccumulation: number
  ): RetirementResult {
    const anosJubilacion = this.inputs.esperanzaVida - this.inputs.edadJubilacion;
    const diasTotales = anosJubilacion * 365;
    let capitalReserva = Math.max(0, capitalReservaInicial);
    let capitalCaja = Math.max(0, capitalCajaInicial);
    
    const gastoDiarioJubilacion = (this.inputs.gastoMensualDeseado * 12) / 365;
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    
    let rendimientoCajaAno = 0;
    let rendimientoReservaAno = 0;
    let gastosAno = 0;
    let deficitAno = 0;
    let capitalAgotadoDia: number | null = null;
    
    let currentMonth = startMonth;
    let currentYear = startYear;
    let currentEdad = startEdad;

    const totalMesesSimulacionAcumulacion = totalMonthsAccumulation;
    const mesesRetiro = (this.inputs.esperanzaVida - this.inputs.edadJubilacion) * 12;

    for (let mesIdx = 1; mesIdx <= mesesRetiro; mesIdx++) {
      const idxGlobal = totalMesesSimulacionAcumulacion + mesIdx;
      const inflacionAcumulada = Math.pow(1 + this.tasaDiariaInflacion, idxGlobal);
      
      const rendCaja = Math.max(0, capitalCaja) * this.tasaDiariaCaja;
      const rendReserva = Math.max(0, capitalReserva) * this.tasaDiariaReserva;
      
      capitalCaja += rendCaja;
      capitalReserva += rendReserva;
      rendimientoCajaAno += rendCaja;
      rendimientoReservaAno += rendReserva;
      
      const gastoMensualDeseadoAjustado = this.inputs.gastoMensualDeseado * inflacionAcumulada;
      
      let gastoRestante = gastoMensualDeseadoAjustado;
      if (capitalCaja > 0) {
        const usarDeCaja = Math.min(capitalCaja, gastoRestante);
        capitalCaja -= usarDeCaja;
        gastoRestante -= usarDeCaja;
      }
      
      if (gastoRestante > 0 && capitalReserva > 0) {
        const usarDeReserva = Math.min(capitalReserva, gastoRestante);
        capitalReserva -= usarDeReserva;
        gastoRestante -= usarDeReserva;
      }
      
      const gastoReal = gastoMensualDeseadoAjustado - gastoRestante;
      gastosAno += gastoReal;
      deficitAno += gastoRestante;
      
      if (capitalCaja <= 1e-9 && capitalReserva <= 1e-9 && capitalAgotadoDia === null) {
        if (gastoRestante > 0) {
          capitalAgotadoDia = mesIdx * 30.4166; // approx days
        }
      }

      // Record monthly progress
      datosMensuales.push({
        mes: currentMonth,
        ano: currentYear,
        edad: currentEdad,
        capitalCaja: Math.round(Math.max(0, capitalCaja) * 100) / 100,
        capitalReserva: Math.round(Math.max(0, capitalReserva) * 100) / 100,
        capitalTotal: Math.round(Math.max(0, capitalCaja + capitalReserva) * 100) / 100,
        gastosMensuales: Math.round(gastoMensualDeseadoAjustado * 100) / 100,
        gastosAnuales: (gastosAno), // temporary accumulation
        gastoMensualAjustado: Math.round(gastoMensualDeseadoAjustado * 100) / 100,
        deficitAnual: Math.round(deficitAno * 100) / 100,
        rendimientoCaja: Math.round(rendCaja * 100) / 100,
        rendimientoReserva: Math.round(rendReserva * 100) / 100,
        rendimientoTotal: Math.round((rendCaja + rendReserva) * 100) / 100,
        referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
      });

      if (currentMonth === 5) { // Transition Jun to Jul
        currentEdad++;
      }

      if (currentMonth === 11 || mesIdx === mesesRetiro) {
        datosAnuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.round(Math.max(0, capitalCaja) * 100) / 100,
          capitalReserva: Math.round(Math.max(0, capitalReserva) * 100) / 100,
          capitalTotal: Math.round(Math.max(0, capitalCaja + capitalReserva) * 100) / 100,
          gastosMensuales: Math.round((gastosAno / 12) * 100) / 100,
          gastosAnuales: Math.round(gastosAno * 100) / 100,
          gastoMensualAjustado: Math.round(gastoMensualDeseadoAjustado * 100) / 100,
          deficitAnual: Math.round(deficitAno * 100) / 100,
          rendimientoCaja: Math.round(rendimientoCajaAno * 100) / 100,
          rendimientoReserva: Math.round(rendimientoReservaAno * 100) / 100,
          rendimientoTotal: Math.round((rendimientoCajaAno + rendimientoReservaAno) * 100) / 100,
          referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
        });
        
        rendimientoCajaAno = 0;
        rendimientoReservaAno = 0;
        gastosAno = 0;
        deficitAno = 0;
        
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
    }

    const anosCubiertos = capitalAgotadoDia !== null ? capitalAgotadoDia / 365 : anosJubilacion;

    return {
      capitalFinal: Math.max(0, capitalReserva + capitalCaja),
      anosCubiertos: Math.round(anosCubiertos * 10) / 10,
      datosAnuales,
      datosMensuales,
      esSuficiente: capitalAgotadoDia === null
    };
  }

  public calculatePerpetualIncome(capital: number): number {
    const tasaRealMensual = (Math.pow(1 + this.tasaDiariaReserva, 30) - 1) - 
                           (Math.pow(1 + this.tasaDiariaInflacion, 30) - 1);
    return capital * tasaRealMensual;
  }

  public runFullSimulation(): FullSimulationResult {
    const acumulacion = this.simulateAccumulation();
    const retiro = this.simulateRetirement(
      acumulacion.capitalReservaFinal, 
      acumulacion.capitalCajaFinal,
      acumulacion.lastMonth,
      acumulacion.lastYear,
      acumulacion.lastEdad,
      acumulacion.datosMensuales.length - 1 // excluding initialState
    );
    const ingresoPerpetuoMensual = this.calculatePerpetualIncome(acumulacion.capitalReservaFinal);
    
    let estado: 'excelente' | 'alcanzable' | 'insuficiente';
    if (retiro.esSuficiente) {
      if (retiro.capitalFinal > acumulacion.capitalReservaFinal * 0.5) {
        estado = 'excelente';
      } else {
        estado = 'alcanzable';
      }
    } else {
      estado = 'insuficiente';
    }

    const tablaAnual = [...acumulacion.datosAnuales, ...retiro.datosAnuales];
    const tablaMensual = [...acumulacion.datosMensuales, ...retiro.datosMensuales];

    return {
      acumulacion,
      retiro,
      ingresoPerpetuoMensual: Math.round(ingresoPerpetuoMensual * 100) / 100,
      estado,
      tablaAnual,
      tablaMensual
    };
  }
}
