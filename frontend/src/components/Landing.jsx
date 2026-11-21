import { useEffect } from 'react'
import {
  Award,
  BadgeCheck,
  Building2,
  Check,
  HardHat,
  Headset,
  Laptop,
  LogIn,
  Monitor,
  MonitorSmartphone,
  Package,
  Router,
  ShieldCheck,
  Tablet,
  Tv,
  Video,
} from 'lucide-react'

const iconLg = 'h-[26px] w-[26px]'

export default function Landing({ onEnter }) {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('scroll-smooth')
    const previousTitle = document.title
    document.title = 'Innovatech Solutions S.A.C. | TechAsset - Plataforma Corporativa'
    return () => {
      root.classList.remove('scroll-smooth')
      document.title = previousTitle
    }
  }, [])

  return (
    <div className="techasset-landing min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800 antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* NAVEGACIÓN SUPERIOR: Solo Logo e "Iniciar Sesión" */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="techasset-landing-nav max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0284c7] rounded-xl p-1"
            title="Inicio TechAsset"
          >
            <img
              src="/techasset-logo.png"
              alt="TechAsset - Innovatech Solutions S.A.C."
              className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>

          <div>
            <button
              type="button"
              onClick={onEnter}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:ring-offset-2"
              title="Iniciar sesión en TechAsset"
            >
              <LogIn className="h-[18px] w-[18px]" />
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="techasset-landing-hero relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F8FAFC] py-8 sm:py-10 lg:py-12 border-b border-slate-200/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-tr from-sky-100/40 via-blue-50/20 to-transparent pointer-events-none blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="techasset-hero-grid grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            <div className="techasset-hero-copy lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-[#0284c7] text-xs font-bold uppercase tracking-wider mb-4 shadow-2xs">
                <BadgeCheck className="h-4 w-4" />
                <span>Innovatech Solutions S.A.C. • Consultoría y Desarrollo TI</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-5xl font-bold text-[#0f2744] tracking-tight leading-[1.08] mb-3">
                Impulsamos el Futuro Digital con{' '}
                <span className="text-[#0284c7]">Soluciones Tecnológicas</span> de Clase Mundial
              </h1>

              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed mb-5 max-w-2xl">
                En <strong>Innovatech Solutions S.A.C.</strong> diseñamos, construimos y escalamos
                software empresarial para clientes nacionales e internacionales. El sistema{' '}
                <strong>TechAsset</strong> garantiza la gestión eficiente y el equipamiento
                tecnológico integral de nuestros equipos de ingeniería y consultoría.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
                <a
                  href="#empresa"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm sm:text-base border border-slate-200 shadow-2xs transition-all duration-150"
                >
                  <Building2 className="h-[19px] w-[19px] text-slate-500" />
                  <span>Conoce nuestra organización</span>
                </a>
              </div>

              <div className="techasset-hero-highlights mt-7 grid gap-3 w-full max-w-xl">
                <div className="flex items-start gap-3">
                  <span className="hero-highlight-icon"><Laptop className="h-4 w-4" /></span>
                  <div>
                    <strong className="hero-highlight-title">Inventario centralizado</strong>
                    <span className="hero-highlight-text">Equipos, categorías y estados en un solo lugar.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="hero-highlight-icon"><ShieldCheck className="h-4 w-4" /></span>
                  <div>
                    <strong className="hero-highlight-title">Préstamos con aprobación</strong>
                    <span className="hero-highlight-text">Solicitud, revisión y devolución con trazabilidad.</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="hero-highlight-icon"><Award className="h-4 w-4" /></span>
                  <div>
                    <strong className="hero-highlight-title">Reportes operativos</strong>
                    <span className="hero-highlight-text">Uso por área, equipos más solicitados e historial.</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5 pt-5 mt-5 border-t border-slate-200/80 w-full max-w-lg">
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#0f2744] block tracking-tight">
                    Alcance Global
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-0.5 block leading-tight">
                    Clientes nacionales e internacionales
                  </span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold text-[#0284c7] block tracking-tight">
                    Ingeniería TI
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-0.5 block leading-tight">
                    Estándares de calidad y buenas prácticas
                  </span>
                </div>
                <div>
                  <span className="text-sm sm:text-base font-bold text-emerald-600 block tracking-tight">
                    Gobernanza
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-0.5 block leading-tight">
                    Trazabilidad y seguridad institucional
                  </span>
                </div>
              </div>
            </div>

            <div className="techasset-hero-media lg:col-span-5 relative">
              <div className="techasset-hero-media-card relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/80 group bg-slate-100">
                <img
                  src="/techasset-hero.jpg"
                  alt="Instalaciones y equipo de desarrollo de Innovatech Solutions S.A.C."
                  className="w-full h-[340px] sm:h-[380px] lg:h-[400px] object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#0b1b30]/90 via-[#0b1b30]/35 to-transparent pointer-events-none"></div>

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
                    <div>
                      <span className="font-bold text-white text-sm block leading-tight">
                        Innovatech Solutions S.A.C.
                      </span>
                      <span className="text-slate-300 text-[11px] block mt-0.5">
                        Centro de Desarrollo Tecnológico • Lima, Perú
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-sky-500/25 border border-sky-400/30 text-cyan-200 text-[11px] font-semibold shrink-0">
                    Sede Central
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Qué Hace la Empresa y Propósito de TechAsset */}
      <section id="empresa" className="py-16 sm:py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] bg-sky-50 px-3 py-1 rounded-full border border-sky-200 inline-block mb-3">
              Nuestra Organización y Visión
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f2744] tracking-tight">
              Innovación Continua Respaldada por Infraestructura Sólida
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3">
              En Innovatech Solutions S.A.C., el talento de nuestros colaboradores se combina con
              tecnología de vanguardia para entregar soluciones de software que superan las
              expectativas del mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center mb-4">
                <MonitorSmartphone className={iconLg} />
              </div>
              <h3 className="text-lg font-bold text-[#0f2744] mb-2">Desarrollo a Medida</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Construcción de aplicaciones web, móviles y sistemas distribuidos con estándares
                modernos de ingeniería, seguridad y diseño centrado en el usuario.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#10B981] flex items-center justify-center mb-4">
                <Package className={iconLg} />
              </div>
              <h3 className="text-lg font-bold text-[#0f2744] mb-2">Plataforma TechAsset</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sistema centralizado desarrollado por nuestra Gerencia de Tecnología para coordinar
                la asignación y préstamo de equipos de forma ágil y transparente.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Award className={iconLg} />
              </div>
              <h3 className="text-lg font-bold text-[#0f2744] mb-2">Excelencia Operativa</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Procesos auditables y políticas de custodia que aseguran que cada equipo se mantenga
                en óptimas condiciones de mantenimiento y rendimiento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Ecosistema Tecnológico de Trabajo */}
      <section className="py-16 sm:py-20 bg-[#F8FAFC] border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] mb-2 block">
              Infraestructura de Trabajo
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2744] tracking-tight">
              Equipamiento Especializado para Cada Especialidad
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Garantizamos que nuestros equipos de desarrollo, QA, diseño e infraestructura cuenten
              con hardware de última generación.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
                <Laptop className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">Laptops Corporativas</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Equipos portátiles de alto rendimiento para programación, integración continua y
                  movilidad laboral de nuestros desarrolladores.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md">
                  Desarrollo &amp; Consultoría
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Monitor className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">Estaciones de Trabajo</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Workstations de alta capacidad de cómputo para análisis masivo de datos,
                  compilación pesada y entornos de laboratorio.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Ingeniería &amp; Datos
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Tv className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">Monitores de Alta Resolución</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Pantallas UltraWide y 4K con fidelidad de color certificada para diseño de
                  interfaces (UI/UX) y productividad multi-ventana.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                  Diseño UX/UI &amp; Productividad
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Tablet className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">
                  Tablets y Dispositivos de Prueba
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Dispositivos móviles táctiles asignados para control de calidad (QA), pruebas de
                  responsividad y testing de apps móviles.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                  Control de Calidad (QA)
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Video className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">
                  Proyectores y Salas Multimedia
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Equipamiento audiovisual para salas de reuniones, demostraciones ejecutivas con
                  clientes y sesiones de planificación sprint.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md">
                  Salas Colaborativas
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-[#0284c7]/40 transition-all flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Router className={iconLg} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0f2744]">
                  Conectividad e Infraestructura
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Routers de alta velocidad, switches administrables y periféricos que aseguran
                  redes estables y seguras para nuestras operaciones.
                </p>
                <span className="inline-block mt-3 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                  Infraestructura &amp; Redes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: Estructura de Colaboración Institucional */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284c7] mb-2 block">
              Gobernanza Corporativa
            </span>
            <h2 className="text-3xl font-extrabold text-[#0f2744] tracking-tight">
              Coordinación Eficiente entre Áreas
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Un flujo de trabajo integrado para la solicitud, asignación y seguimiento de recursos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0f2744]">Gerencia y Administración</h3>
                <span className="text-xs font-semibold text-[#0284c7] uppercase tracking-wider block mt-0.5">
                  Planificación Estratégica
                </span>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Planificación y
                    auditoría de activos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Análisis de indicadores
                    de gestión
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Políticas corporativas
                    de uso tecnológico
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Gerencia de Tecnología
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border-2 border-[#0284c7] bg-white shadow-md flex flex-col justify-between relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 bg-[#0284c7] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
                Soporte TI
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                  <Headset className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0f2744]">Soporte e Infraestructura TI</h3>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider block mt-0.5">
                  Custodia y Asignación
                </span>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Mantenimiento preventivo
                    de equipos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Aprobación y entrega
                    protocolar
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Asistencia técnica y
                    mesa de ayuda
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-teal-700 font-medium">
                  Equipo de Operaciones TI
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-white shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <HardHat className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-[#0f2744]">Colaboradores de Proyecto</h3>
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block mt-0.5">
                  Ingeniería y Consultoría
                </span>
                <ul className="mt-4 space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Solicitud de equipos
                    según necesidad
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Seguimiento ágil del
                    estado de entrega
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" /> Devolución programada y
                    segura
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-medium">
                  Personal activo en proyectos
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BANNER FINAL CTA: Entrada Directa al Login */}
      <section className="py-16 sm:py-20 bg-[#0f2744] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 text-white">
            Portal Institucional TechAsset
          </h2>
          <p className="text-slate-200 text-base max-w-xl mx-auto mb-8 font-normal">
            Si eres colaborador de <strong>Innovatech Solutions S.A.C.</strong>, ingresa con tu
            cuenta corporativa institucional para gestionar tus asignaciones.
          </p>

          <button
            type="button"
            onClick={onEnter}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-150 active:scale-[0.98]"
          >
            <LogIn className="h-[22px] w-[22px]" />
            <span>Iniciar Sesión</span>
          </button>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-[#0b1b30] text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/techasset-logo.png"
              alt="TechAsset"
              className="h-9 w-auto brightness-110 object-contain"
            />
            <span className="text-slate-500 border-l border-slate-700 pl-3">
              Innovatech Solutions S.A.C.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
            <span>Gerencia de Tecnología • Mesa de Ayuda TI: Anexo 2100</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span>ti.soporte@innovatech.com</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
