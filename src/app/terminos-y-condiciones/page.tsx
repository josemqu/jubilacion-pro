import { LayoutDashboard, ChevronLeft, ShieldCheck, AlertCircle, Scale, Info } from "lucide-react";
import Link from "next/link";

export default function TerminosYCondiciones() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Mini Nav */}
      <nav className="h-16 border-b border-slate-800/50 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-full flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-wider">Volver al Simulador</span>
          </Link>
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} className="text-blue-500" />
            <span className="text-sm font-black uppercase tracking-widest text-slate-300">Jubilación Pro</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Header */}
          <header className="space-y-4 border-b border-slate-800 pb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
              Términos y Condiciones
            </h1>
            <p className="text-slate-500 font-medium">Última actualización: 17 de febrero de 2026</p>
          </header>

          {/* Section: Disclaimer */}
          <section className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle size={24} />
              <h2 className="text-xl font-bold uppercase tracking-tight">Descargo de Responsabilidad</h2>
            </div>
            <p className="text-slate-300 leading-relaxed italic">
              "Esta herramienta es exclusivamente para fines educativos e informativos. Los resultados son proyecciones matemáticas estimadas y no garantizan resultados futuros."
            </p>
          </section>

          {/* Detailed Content */}
          <div className="space-y-10 text-slate-400">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck size={20} className="text-blue-500" />
                <h2 className="text-xl font-bold">1. No es Asesoramiento Financiero</h2>
              </div>
              <p className="leading-relaxed">
                Jubilación Pro (en adelante, "la Aplicación") no es un asesor financiero, contador, ni corredor de bolsa. La información proporcionada por la Aplicación no constituye, ni debe ser interpretada como:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Recomendaciones de inversión específicas.</li>
                <li>Asesoramiento legal, fiscal o contable.</li>
                <li>Una oferta o solicitud para comprar o vender valores.</li>
              </ul>
              <p>
                Cualquier decisión tomada basada en la información de este simulador es responsabilidad exclusiva del usuario. Recomendamos consultar con un profesional certificado antes de realizar cualquier inversión o cambio en su estrategia de retiro.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Scale size={20} className="text-blue-500" />
                <h2 className="text-xl font-bold">2. Exactitud de las Proyecciones</h2>
              </div>
              <p className="leading-relaxed">
                Los cálculos realizados por la Aplicación dependen enteramente de los datos introducidos por el usuario (monto de ahorro, rentabilidad esperada, tasa de inflación, etc.). 
                <strong> El mercado financiero es inherentemente volátil</strong> y los rendimientos pasados no garantizan resultados futuros. La Aplicación no se hace responsable de las discrepancias entre las proyecciones y la realidad económica futura.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <Info size={20} className="text-blue-500" />
                <h2 className="text-xl font-bold">3. Privacidad y Datos</h2>
              </div>
              <p className="leading-relaxed">
                La Aplicación opera bajo un modelo de <strong>procesamiento local</strong>. Esto significa que los datos que ingresas no se envían a ningún servidor remoto ni son almacenados por nosotros. Toda su información financiera permanece en su dispositivo. Usted es responsable de la seguridad de su dispositivo y de los archivos (JSON/Excel) que decida exportar.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <AlertCircle size={20} className="text-blue-500" />
                <h2 className="text-xl font-bold">4. Limitación de Responsabilidad</h2>
              </div>
              <p className="leading-relaxed">
                Bajo ninguna circunstancia Jubilación Pro será responsable por daños directos, indirectos, incidentales o especiales (incluyendo, pero no limitado a, la pérdida de capital o beneficios) que surjan del uso o la imposibilidad de uso de esta herramienta.
              </p>
            </section>
          </div>

          {/* Footer of the page */}
          <footer className="pt-12 border-t border-slate-800 flex flex-col items-center gap-6">
            <Link 
              href="/"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              Entendido, volver al simulador
            </Link>
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
              Jubilación Pro • 2026
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
