import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  History,
  Laptop,
  List,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Tag,
  UserCheck,
  Users,
  UserX,
  Wrench,
  XCircle,
} from 'lucide-react'

export default function Dashboard({ role, stats = {}, users = [] }) {
  if (role === 'Colaborador') return <CollaboratorDashboard stats={stats} />
  if (role === 'Responsable de Tecnología') return <TechnologyDashboard stats={stats} />
  return <AdminDashboard stats={stats} users={users} />
}

function Metrics({ cards }) {
  return (
    <div className="dashboard-metrics">
      {cards.map(([label, value, detail, Icon, tone]) => (
        <Metric key={label} label={label} value={value} detail={detail} icon={Icon} tone={tone} />
      ))}
    </div>
  )
}

function AdminDashboard({ stats, users }) {
  const userStats = [
    [
      'Colaboradores activos',
      users.filter((x) => x.activo && x.rol === 'Colaborador').length,
      Users,
    ],
    [
      'Responsables de Tecnología',
      users.filter((x) => x.activo && x.rol === 'Responsable de Tecnología').length,
      UserCheck,
    ],
    [
      'Administradores activos',
      users.filter((x) => x.activo && x.rol === 'Administrador').length,
      ShieldCheck,
    ],
    ['Usuarios inactivos', users.filter((x) => !x.activo).length, UserX],
  ]
  return (
    <div className="dashboard-view">
      <Metrics cards={equipmentCards(stats)} />
      <div className="dashboard-special admin-special">
        <InfoCard
          icon={FileText}
          title="Total de préstamos"
          value={stats.totalPrestamos || 0}
          detail="Solicitudes registradas en el sistema"
          tone="blue"
        />
        <MostUsedCard stats={stats} />
        <InfoCard
          compact
          icon={BarChart3}
          title="Área con mayor uso"
          value={stats.areaMayorUso || 'Sin actividad'}
          detail={`${stats.prestamosAreaMayorUso || 0} préstamos registrados`}
        />
      </div>
      <div className="dashboard-panels">
        <ListPanel
          title="Usuarios del sistema"
          subtitle="Resumen de cuentas por rol y estado"
          badge={`${users.length} TOTAL`}
          items={userStats}
        />
        <ListPanel
          title="Control operativo"
          badge="DATOS ACTUALES"
          items={[
            [
              'Solicitudes pendientes',
              `${stats.prestamosPendientes || 0} esperan una decisión.`,
              Clock3,
            ],
            ['Préstamos activos', `${stats.prestamosActivos || 0} requieren seguimiento.`, Eye],
            [
              'Movimientos históricos',
              `${stats.prestamosDevueltos || 0} devoluciones registradas.`,
              History,
            ],
            [
              'Equipos dados de baja',
              `${stats.equiposBaja || 0} fuera del inventario operativo.`,
              XCircle,
            ],
          ]}
        />
      </div>
    </div>
  )
}

function TechnologyDashboard({ stats }) {
  return (
    <div className="dashboard-view">
      <Metrics
        cards={[
          [
            'Equipos en inventario',
            stats.totalEquipos || 0,
            'Activos tecnológicos visibles',
            Boxes,
            'blue',
          ],
          [
            'Solicitudes pendientes',
            stats.prestamosPendientes || 0,
            'Requieren revisión y decisión',
            Clock3,
            'yellow',
          ],
          [
            'Préstamos activos',
            stats.prestamosActivos || 0,
            'Equipos actualmente asignados',
            CheckCircle2,
            'green',
          ],
          [
            'En mantenimiento',
            stats.equiposMantenimiento || 0,
            'Equipos fuera de servicio',
            Wrench,
            'red',
          ],
        ]}
      />
      <div className="dashboard-special manager-special">
        <InfoCard
          icon={FileText}
          title="Préstamos registrados"
          value={stats.totalPrestamos || 0}
          detail="Historial visible para seguimiento"
          tone="blue"
        />
        <MostUsedCard stats={stats} />
        <InfoCard
          icon={RotateCcw}
          title="Devoluciones por registrar"
          value={stats.prestamosActivos || 0}
          detail="Préstamos activos que deben cerrarse"
        />
      </div>
      <div className="dashboard-panels">
        <ListPanel
          title="Control de inventario"
          items={[
            ['Código patrimonial', 'Identificador único de cada equipo.', Tag],
            [
              'Equipos disponibles',
              `${stats.equiposDisponibles || 0} listos para asignar.`,
              PackageCheck,
            ],
            ['Estado operativo', 'Disponible, prestado, mantenimiento o baja.', Wrench],
            ['Consulta del inventario', 'Búsqueda y filtros de los activos registrados.', List],
          ]}
        />
        <ListPanel
          title="Gestión de préstamos"
          badge="Operaciones"
          items={[
            [
              'Evaluar solicitudes',
              `${stats.prestamosPendientes || 0} pendientes de decisión.`,
              UserCheck,
            ],
            ['Supervisar préstamos', `${stats.prestamosActivos || 0} equipos asignados.`, Eye],
            ['Registrar devoluciones', 'Cierra el préstamo con observaciones.', RotateCcw],
            ['Consultar movimientos', 'Trazabilidad de asignaciones y devoluciones.', History],
          ]}
        />
      </div>
    </div>
  )
}

function CollaboratorDashboard({ stats }) {
  return (
    <div className="dashboard-view">
      <Metrics
        cards={[
          [
            'Mis préstamos',
            stats.totalPrestamos || 0,
            'Solicitudes registradas en mi cuenta',
            FileText,
            'blue',
          ],
          [
            'Pendientes',
            stats.prestamosPendientes || 0,
            'En evaluación por Tecnología',
            Clock3,
            'yellow',
          ],
          [
            'Préstamos activos',
            stats.prestamosActivos || 0,
            'Equipos aprobados o asignados',
            CheckCircle2,
            'green',
          ],
          [
            'Rechazados',
            stats.prestamosRechazados || 0,
            'Solicitudes que no fueron aprobadas',
            XCircle,
            'red',
          ],
        ]}
      />
      <div className="dashboard-special requester-special">
        <InfoCard
          icon={PackageCheck}
          title="Equipos disponibles"
          value={stats.equiposDisponibles || 0}
          detail="Equipos que pueden solicitarse actualmente"
          tone="blue"
        />
        <InfoCard
          icon={Clock3}
          title="Solicitudes pendientes"
          value={stats.prestamosPendientes || 0}
          detail="Tecnología comunicará el resultado"
        />
        <InfoCard
          icon={History}
          title="Préstamos devueltos"
          value={stats.prestamosDevueltos || 0}
          detail="Movimientos conservados en tu historial"
        />
      </div>
      <div className="dashboard-panels">
        <ListPanel
          title="Reglas para solicitar"
          badge="4 reglas"
          items={[
            [
              'Seleccionar equipo disponible',
              'No se admiten equipos en mantenimiento o baja.',
              PackageCheck,
            ],
            ['Completar la solicitud', 'Registra fechas y motivo del préstamo.', FileText],
            ['Esperar la aprobación', 'Tecnología revisará la disponibilidad.', Clock3],
            [
              'Un préstamo activo por equipo',
              'El mismo activo no puede asignarse dos veces.',
              ShieldCheck,
            ],
          ]}
        />
        <ListPanel
          title="Información de mis préstamos"
          badge="Guía de uso"
          items={[
            ['Consultar historial', 'Revisa solicitudes anteriores y préstamos activos.', List],
            ['Ver el detalle', 'Consulta el equipo, fechas y estado.', Eye],
            ['Revisar el estado', 'Pendiente, activo, rechazado o devuelto.', FileText],
            [
              'Devolución registrada',
              'Tecnología cerrará el préstamo con observaciones.',
              RotateCcw,
            ],
          ]}
        />
      </div>
    </div>
  )
}

function equipmentCards(stats) {
  return [
    [
      'Total de equipos',
      stats.totalEquipos || 0,
      'Activos tecnológicos registrados',
      Boxes,
      'blue',
    ],
    [
      'Equipos disponibles',
      stats.equiposDisponibles || 0,
      'Listos para un nuevo préstamo',
      PackageCheck,
      'green',
    ],
    ['Equipos prestados', stats.equiposPrestados || 0, 'Actualmente asignados', Laptop, 'yellow'],
    [
      'En mantenimiento',
      stats.equiposMantenimiento || 0,
      'Temporalmente fuera de servicio',
      Wrench,
      'red',
    ],
  ]
}
function Metric({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className={`dashboard-card dashboard-metric ${tone}`}>
      <div className="metric-heading">
        <span>{label}</span>
        <i>
          <Icon />
        </i>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}
function InfoCard({ icon: Icon, title, value, detail, tone = '', compact = false }) {
  return (
    <article className={`dashboard-card info-card ${tone} ${compact ? 'compact-value' : ''}`}>
      <div className="card-title">
        <span>{title}</span>
        <i>
          <Icon />
        </i>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}
function MostUsedCard({ stats }) {
  return (
    <article className="dashboard-card most-used-card">
      <div className="card-title">
        <span>Equipo más utilizado</span>
      </div>
      <div className="most-used-main">
        <i>
          <Laptop />
        </i>
        <div>
          <strong>{stats.equipoMasUtilizado || 'Sin préstamos'}</strong>
          <small>Uso registrado en el historial</small>
        </div>
      </div>
      <p>{stats.usosEquipoMasUtilizado || 0} préstamos registrados</p>
    </article>
  )
}
function ListPanel({ title, subtitle, badge, items }) {
  return (
    <section className="dashboard-card list-panel">
      <header>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {badge && <em>{badge}</em>}
      </header>
      <div className="list-panel-grid">
        {items.map(([label, value, Icon]) => (
          <article key={label}>
            <div className="list-item-head">
              <i>
                <Icon />
              </i>
              <strong>{label}</strong>
            </div>
            <span className={typeof value === 'number' ? 'item-count' : ''}>{value}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
