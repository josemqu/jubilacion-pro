import { CalculatorInputs, AccumulationResult, RetirementResult, YearData, FullSimulationResult, ReturnPeriod } from './types';

export class RetirementCalculator {
  private inputs: CalculatorInputs;
  // Standard rates
  private tasaMensualCaja: number;
  private tasaMensualReserva: number;
  private tasaMensualInflacion: number;
  
  // Stressed rates (based on Margen de Seguridad)
  private tasaMensualCajaStressed: number;
  private tasaMensualReservaStressed: number;
  private tasaMensualInflacionStressed: number;

  private getMonthlyRate(rate: number, period: ReturnPeriod): number {
    const daysInPeriod = {
      annual: 365,
      monthly: 365 / 12,
      weekly: 7,
      daily: 1
    }[period];
    
    // Effective Monthly Rate: (1 + r_period)^((365/12)/days_in_period) - 1
    return Math.pow(1 + rate / 100, (365 / 12) / daysInPeriod) - 1;
  }

  constructor(inputs: CalculatorInputs) {
    this.inputs = inputs;
    const marginFactor = inputs.margenSeguridad / 100;

    // Compound Monthly Rates
    this.tasaMensualCaja = this.getMonthlyRate(inputs.tasaRetornoCajaAnual, inputs.periodoRetornoCaja);
    this.tasaMensualReserva = this.getMonthlyRate(inputs.tasaRetornoReservaAnual, inputs.periodoRetornoReserva);
    this.tasaMensualInflacion = Math.pow(1 + inputs.inflacionAnual / 100, 1 / 12) - 1;

    // Stressed scenario: lower returns, higher inflation
    this.tasaMensualCajaStressed = this.getMonthlyRate(inputs.tasaRetornoCajaAnual * (1 - marginFactor), inputs.periodoRetornoCaja);
    this.tasaMensualReservaStressed = this.getMonthlyRate(inputs.tasaRetornoReservaAnual * (1 - marginFactor), inputs.periodoRetornoReserva);
    this.tasaMensualInflacionStressed = Math.pow(1 + (inputs.inflacionAnual * (1 + marginFactor)) / 100, 1 / 12) - 1;
  }

  public simulateAccumulation(): AccumulationResult {
    const anosHastaJubilacion = this.inputs.edadJubilacion - this.inputs.edadActual;
    
    let capitalCaja = this.inputs.capitalInicialCaja;
    let capitalReserva = this.inputs.capitalInicialReserva;
    
    // Stressed path
    let capitalCajaStressed = this.inputs.capitalInicialCaja;
    let capitalReservaStressed = this.inputs.capitalInicialReserva;
    
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    const startYear = this.inputs.anoInicio;

    const initialState: YearData = {
      mes: this.inputs.mesInicio,
      ano: startYear,
      edad: this.inputs.edadActual,
      capitalCaja: Math.round(capitalCaja * 100) / 100,
      capitalReserva: Math.round(capitalReserva * 100) / 100,
      capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
      capitalTotalStressed: Math.round((capitalCajaStressed + capitalReservaStressed) * 100) / 100,
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

    let ingresosTrabajoAno = 0;
    let gastosAno = 0;
    let aportesAno = 0;
    let rendCajaAnoAcc = 0;
    let rendReservaAnoAcc = 0;
    
    let currentMonth = this.inputs.mesInicio;
    let currentYear = this.inputs.anoInicio;
    let currentEdad = this.inputs.edadActual;

    let tempMonth = currentMonth;
    let tempEdad = currentEdad;
    let totalMeses = 0;
    while (tempEdad < this.inputs.edadJubilacion) {
      totalMeses++;
      if (tempMonth === this.inputs.mesCumpleanos) tempEdad++; // Birthday
      tempMonth = (tempMonth + 1) % 12;
    }

    for (let mesIdx = 1; mesIdx <= totalMeses; mesIdx++) {
      const inflacionAcumulada = Math.pow(1 + this.tasaMensualInflacion, mesIdx);
      const inflacionAcumuladaStressed = Math.pow(1 + this.tasaMensualInflacionStressed, mesIdx);
      
      // Standard scenario
      const rendCajaMes = capitalCaja * this.tasaMensualCaja;
      const rendReservaMes = capitalReserva * this.tasaMensualReserva;
      capitalCaja += rendCajaMes;
      capitalReserva += rendReservaMes;

      // Stressed scenario
      const rendCajaMesStressed = capitalCajaStressed * this.tasaMensualCajaStressed;
      const rendReservaMesStressed = capitalReservaStressed * this.tasaMensualReservaStressed;
      capitalCajaStressed += rendCajaMesStressed;
      capitalReservaStressed += rendReservaMesStressed;

      const ingresoMesAjustado = this.inputs.ingresoMensual * inflacionAcumulada;
      const gastoMesAjustado = this.inputs.gastoMensual * inflacionAcumulada;

      const ingresoMesStressed = this.inputs.ingresoMensual * inflacionAcumuladaStressed;
      const gastoMesStressed = this.inputs.gastoMensual * inflacionAcumuladaStressed;
      
      // Apply monthly flow (Standard)
      capitalCaja += (ingresoMesAjustado - gastoMesAjustado);
      if (capitalCaja < 0) {
        capitalReserva = Math.max(0, capitalReserva + capitalCaja);
        capitalCaja = 0;
      }

      // Apply monthly flow (Stressed)
      capitalCajaStressed += (ingresoMesStressed - gastoMesStressed);
      if (capitalCajaStressed < 0) {
        capitalReservaStressed = Math.max(0, capitalReservaStressed + capitalCajaStressed);
        capitalCajaStressed = 0;
      }
      
      let aporteRealMensual = 0;
      if (capitalCaja >= this.inputs.aporteMensualJubilacion) {
        capitalCaja -= this.inputs.aporteMensualJubilacion;
        capitalReserva += this.inputs.aporteMensualJubilacion;
        aporteRealMensual = this.inputs.aporteMensualJubilacion;
      }

      if (capitalCajaStressed >= this.inputs.aporteMensualJubilacion) {
        capitalCajaStressed -= this.inputs.aporteMensualJubilacion;
        capitalReservaStressed += this.inputs.aporteMensualJubilacion;
      }

      datosMensuales.push({
        mes: currentMonth,
        ano: currentYear,
        edad: currentEdad,
        capitalCaja: Math.round(capitalCaja * 100) / 100,
        capitalReserva: Math.round(capitalReserva * 100) / 100,
        capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
        capitalTotalStressed: Math.round((capitalCajaStressed + capitalReservaStressed) * 100) / 100,
        ingresosTrabajo: Math.round(ingresoMesAjustado * 100) / 100,
        gastosMensuales: Math.round(gastoMesAjustado * 100) / 100,
        gastosAnuales: gastosAno + gastoMesAjustado,
        aportes: Math.round(aporteRealMensual * 100) / 100,
        rendimientoCaja: Math.round(rendCajaMes * 100) / 100,
        rendimientoReserva: Math.round(rendReservaMes * 100) / 100,
        rendimientoTotal: Math.round((rendCajaMes + rendReservaMes) * 100) / 100,
        referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
      });

      ingresosTrabajoAno += ingresoMesAjustado;
      gastosAno += gastoMesAjustado;
      aportesAno += aporteRealMensual;
      rendCajaAnoAcc += rendCajaMes;
      rendReservaAnoAcc += rendReservaMes;

      if (currentMonth === this.inputs.mesCumpleanos) currentEdad++;
      if (currentMonth === 11 || mesIdx === totalMeses) {
        const rendCajaAno = rendCajaAnoAcc;
        const rendReservaAno = rendReservaAnoAcc;
        
        datosAnuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.round(capitalCaja * 100) / 100,
          capitalReserva: Math.round(capitalReserva * 100) / 100,
          capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
          capitalTotalStressed: Math.round((capitalCajaStressed + capitalReservaStressed) * 100) / 100,
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

        ingresosTrabajoAno = 0;
        gastosAno = 0;
        aportesAno = 0;
        rendCajaAnoAcc = 0;
        rendReservaAnoAcc = 0;
        currentMonth = 0;
        currentYear++;
      } else {
        currentMonth++;
      }
    }

    return {
      capitalCajaFinal: capitalCaja,
      capitalReservaFinal: capitalReserva,
      capitalCajaFinalStressed: capitalCajaStressed,
      capitalReservaFinalStressed: capitalReservaStressed,
      capitalTotalFinal: capitalCaja + capitalReserva,
      datosAnuales,
      datosMensuales,
      aportesOmitidos: 0, 
      aportesRealizados: totalMeses,
      lastMonth: currentMonth,
      lastYear: currentYear,
      lastEdad: currentEdad
    };
  }

  public simulateRetirement(
    capitalReservaInicial: number,
    capitalCajaInicial: number,
    capitalReservaStressedInicial: number,
    capitalCajaStressedInicial: number,
    startMonth: number,
    startYear: number,
    startEdad: number,
    totalMonthsAccumulation: number
  ): RetirementResult {
    let capitalReserva = Math.max(0, capitalReservaInicial);
    let capitalCaja = Math.max(0, capitalCajaInicial);

    // Stressed path - Continues from its own accumulated capital
    let capitalReservaStressed = Math.max(0, capitalReservaStressedInicial);
    let capitalCajaStressed = Math.max(0, capitalCajaStressedInicial);
    
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    
    let currentMonth = startMonth;
    let currentYear = startYear;
    let currentEdad = startEdad;

    const mesesRetiro = (this.inputs.esperanzaVida - this.inputs.edadJubilacion) * 12;
    let capitalAgotadoDia: number | null = null;
    let gastosAno = 0;
    let deficitAno = 0;
    let rendCajaAno = 0;
    let rendReservaAno = 0;

    for (let mesIdx = 1; mesIdx <= mesesRetiro; mesIdx++) {
      const idxGlobal = totalMonthsAccumulation + mesIdx;
      const inflacionAcumulada = Math.pow(1 + this.tasaMensualInflacion, idxGlobal);
      const inflacionAcumuladaStressed = Math.pow(1 + this.tasaMensualInflacionStressed, idxGlobal);
      
      // Standard path
      const rendCaja = Math.max(0, capitalCaja) * this.tasaMensualCaja;
      const rendReserva = Math.max(0, capitalReserva) * this.tasaMensualReserva;
      capitalCaja += rendCaja;
      capitalReserva += rendReserva;
      rendCajaAno += rendCaja;
      rendReservaAno += rendReserva;

      // Stressed path
      const rendCajaStr = Math.max(0, capitalCajaStressed) * this.tasaMensualCajaStressed;
      const rendReservaStr = Math.max(0, capitalReservaStressed) * this.tasaMensualReservaStressed;
      capitalCajaStressed += rendCajaStr;
      capitalReservaStressed += rendReservaStr;
      
      const gastoMensualAjustado = this.inputs.gastoMensualDeseado * inflacionAcumulada;
      const gastoMensualStressed = this.inputs.gastoMensualDeseado * inflacionAcumuladaStressed;
      
      // Withdraw standard
      let resStandard = gastoMensualAjustado;
      const decrCaja = Math.min(capitalCaja, resStandard);
      capitalCaja -= decrCaja;
      resStandard -= decrCaja;
      const decrRes = Math.min(capitalReserva, resStandard);
      capitalReserva -= decrRes;
      resStandard -= decrRes;

      // Withdraw stressed
      let resStressed = gastoMensualStressed;
      const decrCajaStr = Math.min(capitalCajaStressed, resStressed);
      capitalCajaStressed -= decrCajaStr;
      resStressed -= decrCajaStr;
      const decrResStr = Math.min(capitalReservaStressed, resStressed);
      capitalReservaStressed -= decrResStr;
      resStressed -= decrResStr;

      gastosAno += (gastoMensualAjustado - resStandard);
      deficitAno += resStandard;
      
      if (capitalCaja <= 1e-9 && capitalReserva <= 1e-9 && capitalAgotadoDia === null && resStandard > 0) {
        capitalAgotadoDia = mesIdx * 30.4166;
      }

      datosMensuales.push({
        mes: currentMonth,
        ano: currentYear,
        edad: currentEdad,
        capitalCaja: Math.max(0, Math.round(capitalCaja * 100) / 100),
        capitalReserva: Math.max(0, Math.round(capitalReserva * 100) / 100),
        capitalTotal: Math.max(0, Math.round((capitalCaja + capitalReserva) * 100) / 100),
        capitalTotalStressed: Math.max(0, Math.round((capitalCajaStressed + capitalReservaStressed) * 100) / 100),
        gastosMensuales: Math.round(gastoMensualAjustado * 100) / 100,
        gastosAnuales: gastosAno,
        rendimientoCaja: Math.round(rendCaja * 100) / 100,
        rendimientoReserva: Math.round(rendReserva * 100) / 100,
        rendimientoTotal: Math.round((rendCaja + rendReserva) * 100) / 100,
        referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
      });

      if (currentMonth === this.inputs.mesCumpleanos) currentEdad++;
      if (currentMonth === 11 || mesIdx === mesesRetiro) {
        datosAnuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.max(0, Math.round(capitalCaja * 100) / 100),
          capitalReserva: Math.max(0, Math.round(capitalReserva * 100) / 100),
          capitalTotal: Math.max(0, Math.round((capitalCaja + capitalReserva) * 100) / 100),
          capitalTotalStressed: Math.max(0, Math.round((capitalCajaStressed + capitalReservaStressed) * 100) / 100),
          gastosMensuales: Math.round((gastosAno / 12) * 100) / 100,
          gastosAnuales: Math.round(gastosAno * 100) / 100,
          rendimientoCaja: Math.round(rendCajaAno * 100) / 100,
          rendimientoReserva: Math.round(rendReservaAno * 100) / 100,
          rendimientoTotal: Math.round((rendCajaAno + rendReservaAno) * 100) / 100,
          referenciaInflacion: Math.round(inflacionAcumulada * 1000) / 1000
        });
        rendCajaAno = 0; rendReservaAno = 0; gastosAno = 0; deficitAno = 0;
        currentMonth = 0; currentYear++;
      } else {
        currentMonth++;
      }
    }

    return {
      capitalFinal: Math.max(0, capitalReserva + capitalCaja),
      anosCubiertos: capitalAgotadoDia !== null ? Math.round((capitalAgotadoDia / 365) * 10) / 10 : mesesRetiro / 12,
      datosAnuales,
      datosMensuales,
      esSuficiente: capitalAgotadoDia === null
    };
  }

  public calculatePerpetualIncome(capital: number): number {
    // Real Return = ((1 + target_return) / (1 + inflation)) - 1
    const tasaRealMensual = ((1 + this.tasaMensualReserva) / (1 + this.tasaMensualInflacion)) - 1;
    return capital * tasaRealMensual;
  }

  public runFullSimulation(): FullSimulationResult {
    const acumulacion = this.simulateAccumulation();
    const retiro = this.simulateRetirement(
      acumulacion.capitalReservaFinal, 
      acumulacion.capitalCajaFinal,
      acumulacion.capitalReservaFinalStressed,
      acumulacion.capitalCajaFinalStressed,
      acumulacion.lastMonth,
      acumulacion.lastYear,
      acumulacion.lastEdad,
      acumulacion.datosMensuales.length - 1
    );
    
    const ingresoPerpetuoMensual = this.calculatePerpetualIncome(acumulacion.capitalReservaFinal);
    
    let estado: 'excelente' | 'alcanzable' | 'insuficiente';
    if (retiro.esSuficiente) {
      estado = (retiro.capitalFinal > acumulacion.capitalReservaFinal * 0.5) ? 'excelente' : 'alcanzable';
    } else {
      estado = 'insuficiente';
    }

    return {
      acumulacion,
      retiro,
      ingresoPerpetuoMensual: Math.round(ingresoPerpetuoMensual * 100) / 100,
      estado,
      tablaAnual: [...acumulacion.datosAnuales, ...retiro.datosAnuales],
      tablaMensual: [...acumulacion.datosMensuales, ...retiro.datosMensuales]
    };
  }
}

