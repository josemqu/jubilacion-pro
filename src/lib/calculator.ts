import { CalculatorInputs, AccumulationResult, RetirementResult, YearData, FullSimulationResult } from './types';

export class RetirementCalculator {
  private inputs: CalculatorInputs;
  private tasaDiariaCaja: number;
  private tasaDiariaReserva: number;
  private tasaDiariaInflacion: number;

  constructor(inputs: CalculatorInputs) {
    this.inputs = inputs;
    this.tasaDiariaCaja = (inputs.tasaRetornoCajaAnual / 100) / 365;
    this.tasaDiariaReserva = (inputs.tasaRetornoReservaAnual / 100) / 365;
    this.tasaDiariaInflacion = (inputs.inflacionAnual / 100) / 365;
  }

  public simulateAccumulation(): AccumulationResult {
    const anosHastaJubilacion = this.inputs.edadJubilacion - this.inputs.edadActual;
    const diasTotales = anosHastaJubilacion * 365;
    
    let capitalCaja = this.inputs.capitalInicialCaja;
    let capitalReserva = this.inputs.capitalInicialReserva;
    
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    const startYear = this.inputs.anoInicio;

    // Estado inicial (Año 0)
    datosAnuales.push({
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
      rendimientoTotal: 0
    });

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

    for (let dia = 1; dia <= diasTotales; dia++) {
      capitalCaja *= (1 + this.tasaDiariaCaja);
      capitalReserva *= (1 + this.tasaDiariaReserva);
      
      const inflacionAcumulada = Math.pow(1 + this.tasaDiariaInflacion, dia);
      const gastoDiario = (this.inputs.gastoMensual * 12) / 365;
      const gastoDiarioAjustado = gastoDiario * inflacionAcumulada;
      
      capitalCaja -= gastoDiarioAjustado;
      gastosAno += gastoDiarioAjustado;
      
      if (capitalCaja < 0) capitalCaja = 0;
      
      if (dia % 30 === 0) {
        const ingresoAjustado = this.inputs.ingresoMensual * inflacionAcumulada;
        capitalCaja += ingresoAjustado;
        ingresosTrabajoAno += ingresoAjustado;
        
        if (capitalCaja >= this.inputs.aporteMensualJubilacion) {
          capitalCaja -= this.inputs.aporteMensualJubilacion;
          capitalReserva += this.inputs.aporteMensualJubilacion;
          aportesAno += this.inputs.aporteMensualJubilacion;
        } else {
          aportesOmitidos++;
        }

        const rendimientoCajaMes = capitalCaja - currentCajaMensual - ingresosTrabajoMes + gastosMes + aportesMes;
        const rendimientoReservaMes = capitalReserva - currentReservaMensual - aportesMes;

        datosMensuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.round(capitalCaja * 100) / 100,
          capitalReserva: Math.round(capitalReserva * 100) / 100,
          capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
          ingresosTrabajo: Math.round(ingresosTrabajoMes * 100) / 100,
          gastosMensuales: Math.round(gastosMes * 100) / 100,
          gastosAnuales: Math.round(gastosAno * 100) / 100,
          aportes: Math.round(aportesMes * 100) / 100,
          rendimientoCaja: Math.round(rendimientoCajaMes * 100) / 100,
          rendimientoReserva: Math.round(rendimientoReservaMes * 100) / 100,
          rendimientoTotal: Math.round((rendimientoCajaMes + rendimientoReservaMes) * 100) / 100
        });

        currentCajaMensual = capitalCaja;
        currentReservaMensual = capitalReserva;
        gastosMes = 0;
        ingresosTrabajoMes = 0;
        aportesMes = 0;

        if (currentMonth === 5) {
          currentEdad++;
        }

        // Check if it's the end of the year (December) or the end of the simulation
        if (currentMonth === 11 || dia + 30 > diasTotales) {
          const rendimientoCaja = capitalCaja - capitalCajaInicioAno - ingresosTrabajoAno + gastosAno + aportesAno;
          const rendimientoReserva = capitalReserva - capitalReservaInicioAno - aportesAno;
          const flujoNeto = ingresosTrabajoAno - gastosAno - aportesAno;
          
          datosAnuales.push({
            ano: currentYear,
            edad: currentEdad,
            capitalCaja: Math.round(capitalCaja * 100) / 100,
            capitalReserva: Math.round(capitalReserva * 100) / 100,
            capitalTotal: Math.round((capitalCaja + capitalReserva) * 100) / 100,
            ingresosTrabajo: Math.round(ingresosTrabajoAno * 100) / 100,
            gastosMensuales: Math.round((gastosAno / 12) * 100) / 100,
            gastosAnuales: Math.round(gastosAno * 100) / 100,
            aportes: Math.round(aportesAno * 100) / 100,
            flujoNeto: Math.round(flujoNeto * 100) / 100,
            rendimientoCaja: Math.round(rendimientoCaja * 100) / 100,
            rendimientoReserva: Math.round(rendimientoReserva * 100) / 100, // Should use the current yearly values
            rendimientoTotal: Math.round((rendimientoCaja + rendimientoReserva) * 100) / 100
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
    }

    return {
      capitalCajaFinal: capitalCaja,
      capitalReservaFinal: capitalReserva,
      capitalTotalFinal: capitalCaja + capitalReserva,
      datosAnuales,
      datosMensuales,
      aportesOmitidos,
      aportesRealizados: Math.floor(diasTotales / 30) - aportesOmitidos
    };
  }

  public simulateRetirement(
    capitalReservaInicial: number,
    capitalCajaInicial: number
  ): RetirementResult {
    const anosJubilacion = this.inputs.esperanzaVida - this.inputs.edadJubilacion;
    const diasTotales = anosJubilacion * 365;
    let capitalReserva = Math.max(0, capitalReservaInicial);
    let capitalCaja = Math.max(0, capitalCajaInicial);
    
    const gastoDiarioJubilacion = (this.inputs.gastoMensualDeseado * 12) / 365;
    const datosAnuales: YearData[] = [];
    const datosMensuales: YearData[] = [];
    const startYear = this.inputs.anoInicio;
    const diasAcumulacion = (this.inputs.edadJubilacion - this.inputs.edadActual) * 365;
    
    let rendimientoCajaAno = 0;
    let rendimientoReservaAno = 0;
    let gastosAno = 0;
    let deficitAno = 0;
    let capitalAgotadoDia: number | null = null;
    
    let currentCajaMensual = capitalCaja;
    let currentReservaMensual = capitalReserva;
    let rendimientoCajaMes = 0;
    let rendimientoReservaMes = 0;
    let gastosMes = 0;
    let deficitMes = 0;

    let currentMonth = this.inputs.mesInicio;
    let currentYear = this.inputs.anoInicio + (this.inputs.edadJubilacion - this.inputs.edadActual);
    let currentEdad = this.inputs.edadJubilacion;

    for (let dia = 1; dia <= diasTotales; dia++) {
      const interesCaja = Math.max(0, capitalCaja) * this.tasaDiariaCaja;
      const interesReserva = Math.max(0, capitalReserva) * this.tasaDiariaReserva;
      
      capitalCaja += interesCaja;
      capitalReserva += interesReserva;
      rendimientoCajaAno += interesCaja;
      rendimientoReservaAno += interesReserva;
      rendimientoCajaMes += interesCaja;
      rendimientoReservaMes += interesReserva;
      
      const diasTotalesSimulacion = diasAcumulacion + dia;
      const inflacionAcumulada = Math.pow(1 + this.tasaDiariaInflacion, diasTotalesSimulacion);
      const gastoProyectado = gastoDiarioJubilacion * inflacionAcumulada;
      
      let gastoRestante = gastoProyectado;
      
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
      
      const gastoReal = gastoProyectado - gastoRestante;
      gastosAno += gastoReal;
      gastosMes += gastoReal;
      deficitAno += gastoRestante;
      deficitMes += gastoRestante;
      
      if (capitalCaja <= 1e-9 && capitalReserva <= 1e-9 && capitalAgotadoDia === null) {
        if (gastoRestante > 0) {
          capitalAgotadoDia = dia;
        }
      }

      if (dia % 30 === 0) {
        datosMensuales.push({
          mes: currentMonth,
          ano: currentYear,
          edad: currentEdad,
          capitalCaja: Math.round(Math.max(0, capitalCaja) * 100) / 100,
          capitalReserva: Math.round(Math.max(0, capitalReserva) * 100) / 100,
          capitalTotal: Math.round(Math.max(0, capitalCaja + capitalReserva) * 100) / 100,
          gastosMensuales: Math.round(gastosMes * 100) / 100,
          gastosAnuales: Math.round(gastosAno * 100) / 100,
          gastoMensualAjustado: Math.round((gastoProyectado * 365 / 12) * 100) / 100,
          deficitAnual: Math.round(deficitAno * 100) / 100,
          rendimientoCaja: Math.round(rendimientoCajaMes * 100) / 100,
          rendimientoReserva: Math.round(rendimientoReservaMes * 100) / 100,
          rendimientoTotal: Math.round((rendimientoCajaMes + rendimientoReservaMes) * 100) / 100
        });

        rendimientoCajaMes = 0;
        rendimientoReservaMes = 0;
        gastosMes = 0;
        deficitMes = 0;

        if (currentMonth === 5) {
          currentEdad++;
        }

        if (currentMonth === 11 || dia + 30 > diasTotales) {
          datosAnuales.push({
            ano: currentYear,
            edad: currentEdad,
            capitalCaja: Math.round(Math.max(0, capitalCaja) * 100) / 100,
            capitalReserva: Math.round(Math.max(0, capitalReserva) * 100) / 100,
            capitalTotal: Math.round(Math.max(0, capitalCaja + capitalReserva) * 100) / 100,
            gastosMensuales: Math.round((gastosAno / 12) * 100) / 100,
            gastosAnuales: Math.round(gastosAno * 100) / 100,
            gastoMensualAjustado: Math.round((gastoProyectado * 365 / 12) * 100) / 100,
            deficitAnual: Math.round(deficitAno * 100) / 100,
            rendimientoCaja: Math.round(rendimientoCajaAno * 100) / 100,
            rendimientoReserva: Math.round(rendimientoReservaAno * 100) / 100,
            rendimientoTotal: Math.round((rendimientoCajaAno + rendimientoReservaAno) * 100) / 100
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
    const retiro = this.simulateRetirement(acumulacion.capitalReservaFinal, acumulacion.capitalCajaFinal);
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
