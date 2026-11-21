import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  BarChart3,
  Bell,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  History,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Moon,
  PackageCheck,
  Plus,
  RotateCcw,
  Save,
  Search,
  SquarePen,
  Sun,
  Trash2,
  UserRound,
  Users,
  UserX,
  XCircle,
} from 'lucide-react'
import { getSession, request, saveSession } from './api'
import {
  AlertMessage,
  Button,
  DateInput,
  PasswordInput,
  SelectInput,
  TextInput,
} from './components/FormControls'
import Login from './components/Login'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import { Estado, ListFilters, ModalConfirmacion, Pagination, TableList } from './components/UI'

const titles = {
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  equipos: 'Equipos tecnológicos',
  disponibilidad: 'Equipos disponibles',
  solicitar: 'Solicitar préstamo',
  prestamos: 'Préstamos',
  devoluciones: 'Devoluciones',
  reportes: 'Reportes',
}
const today = () => new Date().toISOString().slice(0, 10)
const nextDay = (value) => {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
const institutionalEmail = /^[^\s@]+@innovatech\.com$/i
const showValidation = (form, nextErrors, setErrors) => {
  setErrors(nextErrors)
  const first = Object.keys(nextErrors)[0]
  if (first) requestAnimationFrame(() => form.elements.namedItem(first)?.focus())
  return !first
}

export default function App() {
  const [session, setSession] = useState(getSession())
  const [showLogin, setShowLogin] = useState(() =>
    new URLSearchParams(location.search).has('resetToken'),
  )
  const [view, setView] = useState('dashboard')
  const [data, setData] = useState({
    equipos: [],
    prestamos: [],
    usuarios: [],
    stats: {},
    reportes: {},
  })
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Todos')
  const [page, setPage] = useState(1)
  const [theme, setTheme] = useState(() => localStorage.getItem('techasset-theme') || 'light')
  const [fontLarge, setFontLarge] = useState(
    () => localStorage.getItem('techasset-responsible-font-size') === 'large',
  )
  const [profileOpen, setProfileOpen] = useState(false)
  const role = session?.rol

  // El menú se deriva del rol para no mostrar rutas que el usuario no puede ejecutar.
  const nav = useMemo(
    () =>
      role === 'Administrador'
        ? [
            ['dashboard', 'Dashboard', LayoutDashboard],
            ['usuarios', 'Usuarios', Users],
            ['equipos', 'Equipos', Boxes],
            ['prestamos', 'Préstamos', ClipboardList],
            ['reportes', 'Reportes', BarChart3],
          ]
        : role === 'Responsable de Tecnología'
          ? [
              ['dashboard', 'Dashboard', LayoutDashboard],
              ['equipos', 'Inventario', Boxes],
              ['prestamos', 'Gestión de préstamos', ClipboardList],
              ['devoluciones', 'Devoluciones', RotateCcw],
            ]
          : [
              ['dashboard', 'Dashboard', LayoutDashboard],
              ['disponibilidad', 'Disponibilidad', PackageCheck],
              ['solicitar', 'Solicitar préstamo', Plus],
              ['prestamos', 'Mis préstamos', History],
            ],
    [role],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('techasset-theme', theme)
  }, [theme])
  useEffect(() => {
    if (role === 'Responsable de Tecnología')
      localStorage.setItem('techasset-responsible-font-size', fontLarge ? 'large' : 'normal')
  }, [role, fontLarge])
  useEffect(() => {
    setSearch('')
    setFilter('Todos')
    setPage(1)
  }, [view])
  useEffect(() => {
    const closeMenu = (event) => event.key === 'Escape' && setProfileOpen(false)
    document.addEventListener('keydown', closeMenu)
    return () => document.removeEventListener('keydown', closeMenu)
  }, [])
  useEffect(() => {
    load()
  }, [session])

  const logout = () => {
    setProfileOpen(false)
    request('/auth/logout', { method: 'POST' }).catch(() => {})
    saveSession(null)
    setSession(null)
    setModal(null)
    setShowLogin(false)
  }
  // Carga en paralelo la información común y solicita datos administrativos solo cuando corresponde.
  const load = async () => {
    if (!session || session.requiereCambioPassword) return
    try {
      setLoading(true)
      const [equipos, prestamos, stats] = await Promise.all([
        request('/equipos'),
        request('/prestamos'),
        request('/dashboard'),
      ])
      let usuarios = [],
        reportes = {}
      if (role === 'Administrador') {
        usuarios = await request('/usuarios')
        const [estados, utilizados, movimientos, areas] = await Promise.all([
          request('/reportes/equipos-por-estado'),
          request('/reportes/equipos-mas-utilizados'),
          request('/reportes/movimientos'),
          request('/reportes/prestamos-por-area'),
        ])
        reportes = { estados, utilizados, movimientos, areas }
      }
      setData({ equipos, prestamos, stats, usuarios, reportes })
    } catch (e) {
      setNotice({ type: 'error', message: e.message })
      if (e.message.includes('sesión')) logout()
    } finally {
      setLoading(false)
    }
  }
  const login = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      setLoading(true)
      const result = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo: f.get('correo'), password: f.get('password') }),
      })
      saveSession(result, f.get('recordar') === 'on')
      setSession(result)
      setView('dashboard')
      setNotice(null)
    } catch (e) {
      setNotice({ type: 'error', message: e.message })
    } finally {
      setLoading(false)
    }
  }
  const forgot = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      const r = await request('/auth/olvide-password', {
        method: 'POST',
        body: JSON.stringify({ correo: f.get('correo') }),
      })
      setNotice({ type: 'success', message: r.mensaje })
    } catch (e) {
      setNotice({ type: 'error', message: e.message })
    }
  }
  const reset = async (e, token) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      const r = await request('/auth/restablecer-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          nuevaPassword: f.get('nuevaPassword'),
          confirmarPassword: f.get('confirmarPassword'),
        }),
      })
      history.replaceState({}, '', location.pathname)
      setNotice({ type: 'success', message: r.mensaje })
      return true
    } catch (e) {
      setNotice({ type: 'error', message: e.message })
      return false
    }
  }
  const initialPassword = async (e) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    try {
      await request('/auth/cambiar-password-inicial', {
        method: 'POST',
        body: JSON.stringify({
          nuevaPassword: f.get('nuevaPassword'),
          confirmarPassword: f.get('confirmarPassword'),
        }),
      })
      saveSession(null)
      setSession(null)
      setNotice({ type: 'success', message: 'Contraseña actualizada. Inicia sesión nuevamente.' })
    } catch (e) {
      setNotice({ type: 'error', message: e.message })
    }
  }
  const open = (value) => {
    setErrors({})
    setModal(value)
  }
  const close = () => {
    setErrors({})
    setModal(null)
  }
  const done = (message) => {
    close()
    setNotice({ type: 'success', message })
    load()
  }
  const submit = async (action, message) => {
    try {
      setSaving(true)
      await action()
      done(message)
    } catch (e) {
      setErrors({ general: e.message })
    } finally {
      setSaving(false)
    }
  }

  if (!session && !showLogin) return <Landing onEnter={() => setShowLogin(true)} />
  if (!session)
    return (
      <Login
        onSubmit={login}
        onForgotPassword={forgot}
        onResetPassword={reset}
        loading={loading}
        notice={notice}
        close={() => setNotice(null)}
        onBackToLanding={() => setShowLogin(false)}
      />
    )
  if (session.requiereCambioPassword)
    return (
      <Login
        forcePasswordChange
        accountEmail={session.correo}
        onChangePassword={initialPassword}
        loading={loading}
        notice={notice}
        close={() => setNotice(null)}
      />
    )
  const go = (value) => {
    setProfileOpen(false)
    setView(value)
    setPage(1)
  }
  const content = () => {
    if (view === 'dashboard')
      return <Dashboard role={role} stats={data.stats} users={data.usuarios} />
    if (view === 'usuarios')
      return (
        <UsersView
          items={data.usuarios}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          page={page}
          setPage={setPage}
          open={open}
        />
      )
    if (view === 'equipos' || view === 'disponibilidad')
      return (
        <EquipmentView
          items={data.equipos}
          role={role}
          availableOnly={view === 'disponibilidad'}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          page={page}
          setPage={setPage}
          open={open}
        />
      )
    if (view === 'solicitar')
      return (
        <RequestView items={data.equipos.filter((x) => x.estado === 'Disponible')} open={open} />
      )
    if (view === 'devoluciones')
      return (
        <LoansView
          items={data.prestamos.filter((x) => x.estado === 'Activo')}
          role={role}
          page={page}
          setPage={setPage}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          open={open}
          returnsOnly
        />
      )
    if (view === 'prestamos')
      return (
        <LoansView
          items={data.prestamos}
          role={role}
          page={page}
          setPage={setPage}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          open={open}
        />
      )
    return <Reports data={data.reportes} />
  }
  return (
    <div
      className={`app-shell role-${role === 'Responsable de Tecnología' ? 'responsable' : role?.toLowerCase()} ${fontLarge ? 'responsible-font-large' : ''}`}
    >
      <aside>
        <div className="brand">
          <img src="/techasset-logo-mark.png" alt="TechAsset" />
          <div>
            <b>TechAsset</b>
            <small>Inventario tecnológico</small>
          </div>
        </div>
        <span className="menu-label">Menú principal</span>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={view === id ? 'active' : ''} onClick={() => go(id)}>
              <Icon />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <small>Sistema operativo</small>
          <b>Innovatech</b>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <h1>
              {view === 'dashboard'
                ? role === 'Administrador'
                  ? 'Dashboard administrativo'
                  : role === 'Responsable de Tecnología'
                    ? 'Dashboard de Tecnología'
                    : 'Dashboard del colaborador'
                : titles[view]}
            </h1>
            <span>Bienvenido, {session.nombreCompleto}</span>
          </div>
          <div className="header-actions">
            <div className="header-tools">
              <button
                className="header-icon-button notification-button"
                aria-label="Notificaciones"
              >
                <Bell />
                <i />
              </button>
              <button
                className="header-icon-button"
                aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'}
                onClick={() => setTheme((x) => (x === 'dark' ? 'light' : 'dark'))}
              >
                {theme === 'dark' ? <Sun /> : <Moon />}
              </button>
              {role === 'Responsable de Tecnología' && (
                <div className="font-size-controls" aria-label="Tamaño de texto">
                  <button
                    type="button"
                    className={fontLarge ? 'active' : ''}
                    onClick={() => setFontLarge(true)}
                  >
                    A+
                  </button>
                  <button type="button" disabled={!fontLarge} onClick={() => setFontLarge(false)}>
                    A−
                  </button>
                </div>
              )}
            </div>
            <span className="header-divider" />
            <div className="profile-menu-wrap">
              <button
                className="profile-trigger"
                type="button"
                aria-label="Menú del usuario"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="avatar">
                  <UserRound />
                </span>
                <span>
                  <b>{session.nombreCompleto}</b>
                  <small>{role}</small>
                </span>
                <ChevronDown className={profileOpen ? 'rotated' : ''} />
              </button>
              {profileOpen && (
                <div className="header-popover profile-popover">
                  <div>
                    <strong>{session.nombreCompleto}</strong>
                    <span>{session.correo}</span>
                  </div>
                  <button type="button" onClick={logout}>
                    <LogOut />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <AlertMessage
          message={notice?.message}
          type={notice?.type}
          onClose={() => setNotice(null)}
        />
        {loading ? <div className="loading-state">Actualizando información…</div> : content()}
      </main>
      <Modals
        modal={modal}
        equipos={data.equipos}
        errors={errors}
        setErrors={setErrors}
        saving={saving}
        close={close}
        open={open}
        submit={submit}
      />
    </div>
  )
}

function UsersView({ items, search, setSearch, filter, setFilter, page, setPage, open }) {
  const [statusFilter, setStatusFilter] = useState('Todos')
  const rows = items.filter((item) => {
    const matchesSearch = `${item.nombreCompleto} ${item.correo} ${item.area}`
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesRole = filter === 'Todos' || item.rol === filter
    const status = item.activo ? 'Activo' : 'Inactivo'
    return matchesSearch && matchesRole && (statusFilter === 'Todos' || status === statusFilter)
  })
  const changeFilter = (setter, value) => {
    setter(value)
    setPage(1)
  }
  return (
    <section className="panel">
      <PanelTitle
        title="Usuarios del sistema"
        subtitle="Cuentas, áreas, roles y acceso"
        action={
          <Button onClick={() => open({ type: 'user' })}>
            <Plus />
            Nuevo usuario
          </Button>
        }
      />
      <ListFilters
        search={search}
        onSearch={(value) => changeFilter(setSearch, value)}
        placeholder="Buscar por nombre, correo o área"
        filters={[
          {
            key: 'role',
            label: 'Rol',
            value: filter,
            onChange: (value) => changeFilter(setFilter, value),
            options: ['Todos', 'Administrador', 'Responsable de Tecnología', 'Colaborador'],
          },
          {
            key: 'status',
            label: 'Estado',
            value: statusFilter,
            onChange: (value) => changeFilter(setStatusFilter, value),
            options: ['Todos', 'Activo', 'Inactivo'],
          },
        ]}
      />
      <TableList
        rows={rows.slice((page - 1) * 7, page * 7)}
        columns={[
          {
            key: 'nombre',
            label: 'Nombre',
            render: (item) => <strong>{item.nombreCompleto}</strong>,
          },
          { key: 'correo', label: 'Correo' },
          { key: 'area', label: 'Área' },
          { key: 'rol', label: 'Rol' },
          {
            key: 'estado',
            label: 'Estado',
            render: (item) => <Estado value={item.activo ? 'Activo' : 'Inactivo'} />,
          },
          {
            key: 'actions',
            label: 'Acciones',
            render: (item) => (
              <div className="row-actions">
                <button className="action-button edit" onClick={() => open({ type: 'user', item })}>
                  <SquarePen />
                  <span>Editar</span>
                </button>
                {item.activo && (
                  <button
                    className="action-button reject"
                    onClick={() => open({ type: 'disable-user', item })}
                  >
                    <UserX />
                    <span>Deshabilitar</span>
                  </button>
                )}
              </div>
            ),
          },
        ]}
      />
      <Pagination
        page={page}
        total={rows.length}
        pageSize={7}
        onChange={setPage}
        itemLabel="usuarios"
      />
    </section>
  )
}
function EquipmentView({
  items,
  role,
  availableOnly,
  search,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  open,
}) {
  const base = availableOnly ? items.filter((x) => x.estado === 'Disponible') : items,
    rows = base.filter(
      (x) =>
        `${x.codigoPatrimonial} ${x.nombre} ${x.categoria} ${x.marca}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (filter === 'Todos' || x.estado === filter),
    )
  return (
    <ListPanel
      title={availableOnly ? 'Equipos disponibles' : 'Inventario tecnológico'}
      subtitle="Código patrimonial, categoría, marca y estado"
      action={
        !availableOnly && role !== 'Colaborador' ? (
          <Button onClick={() => open({ type: 'equipment' })}>
            <Plus />
            Nuevo equipo
          </Button>
        ) : null
      }
      search={search}
      setSearch={setSearch}
      placeholder="Buscar por código, nombre, categoría o marca"
      filter={filter}
      setFilter={setFilter}
      options={['Todos', 'Disponible', 'Prestado', 'Mantenimiento', 'Baja']}
      label="Estado"
      page={page}
      setPage={setPage}
      total={rows.length}
      itemLabel="equipos"
      assets
    >
      <div className="asset-grid">
        {rows.slice((page - 1) * 6, page * 6).map((x) => (
          <article className={`asset-card state-${x.estado.toLowerCase()}`} key={x.id}>
            <div className="asset-head">
              <span className="asset-icon">
                <Boxes />
              </span>
              <Estado value={x.estado} />
            </div>
            <h3>{x.nombre}</h3>
            <b>{x.codigoPatrimonial}</b>
            <div className="asset-meta">
              <span>{x.categoria}</span>
              <span>{x.marca}</span>
            </div>
            {!availableOnly && role === 'Administrador' && (
              <button className="asset-edit" onClick={() => open({ type: 'equipment', item: x })}>
                <SquarePen />
                Editar
              </button>
            )}
          </article>
        ))}
      </div>
      {!rows.length && (
        <p className="filtered-empty">No hay equipos que coincidan con los filtros.</p>
      )}
    </ListPanel>
  )
}
function RequestView({ items, open }) {
  return (
    <section className="panel">
      <PanelTitle
        title="Nueva solicitud de préstamo"
        subtitle="Selecciona un equipo disponible y registra el periodo"
      />
      <div className="request-catalog">
        {items.map((x) => (
          <article key={x.id}>
            <span>
              <Boxes />
            </span>
            <div>
              <strong>{x.nombre}</strong>
              <small>
                {x.codigoPatrimonial} · {x.categoria} · {x.marca}
              </small>
            </div>
            <Button onClick={() => open({ type: 'loan', item: x })}>Solicitar</Button>
          </article>
        ))}
      </div>
      {!items.length && (
        <p className="filtered-empty">No existen equipos disponibles en este momento.</p>
      )}
    </section>
  )
}
function LoansView({
  items,
  role,
  search,
  setSearch,
  filter,
  setFilter,
  page,
  setPage,
  open,
  returnsOnly,
}) {
  const rows = items.filter(
    (x) =>
      `${x.equipo} ${x.codigoPatrimonial} ${x.colaborador} ${x.area}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === 'Todos' || x.estado === filter),
  )
  return (
    <ListPanel
      title={
        returnsOnly
          ? 'Devoluciones pendientes'
          : role === 'Colaborador'
            ? 'Mis préstamos'
            : 'Gestión de préstamos'
      }
      subtitle={
        returnsOnly
          ? 'Préstamos activos que deben cerrarse'
          : 'Seguimiento completo de solicitudes y asignaciones'
      }
      search={search}
      setSearch={setSearch}
      placeholder="Buscar equipo, código, colaborador o área"
      filter={filter}
      setFilter={setFilter}
      options={['Todos', 'Pendiente', 'Activo', 'Devuelto', 'Rechazado', 'Cancelado']}
      label="Estado"
      page={page}
      setPage={setPage}
      total={rows.length}
      itemLabel="préstamos"
    >
      <TableList
        rows={rows.slice((page - 1) * 7, page * 7)}
        columns={[
          {
            key: 'equipo',
            label: 'Equipo',
            render: (x) => (
              <>
                <strong>{x.equipo}</strong>
                <small>{x.codigoPatrimonial}</small>
              </>
            ),
          },
          {
            key: 'colaborador',
            label: 'Colaborador',
            render: (x) => (
              <>
                {x.colaborador}
                <small>{x.area}</small>
              </>
            ),
          },
          {
            key: 'periodo',
            label: 'Periodo',
            render: (x) => (
              <>
                {x.fechaPrestamo}
                <small>hasta {x.fechaDevolucionProgramada}</small>
              </>
            ),
          },
          { key: 'estado', label: 'Estado', render: (x) => <Estado value={x.estado} /> },
          {
            key: 'acciones',
            label: 'Acciones',
            render: (x) => (
              <LoanActions item={x} role={role} open={open} returnsOnly={returnsOnly} />
            ),
          },
        ]}
      />
    </ListPanel>
  )
}
function LoanActions({ item, role, open, returnsOnly }) {
  return (
    <div className="row-actions">
      <button className="action-button" onClick={() => open({ type: 'detail', item })}>
        <Eye />
        <span>Detalle</span>
      </button>
      {role === 'Responsable de Tecnología' && item.estado === 'Pendiente' && (
        <>
          <button className="action-button approve" onClick={() => open({ type: 'approve', item })}>
            <CheckCircle2 />
            <span>Aprobar</span>
          </button>
          <button className="action-button reject" onClick={() => open({ type: 'reject', item })}>
            <XCircle />
            <span>Rechazar</span>
          </button>
        </>
      )}
      {returnsOnly && role === 'Responsable de Tecnología' && item.estado === 'Activo' && (
        <button className="action-button" onClick={() => open({ type: 'return', item })}>
          <RotateCcw />
          <span>Devolver</span>
        </button>
      )}
      {role === 'Colaborador' && item.estado === 'Pendiente' && (
        <button className="action-button reject" onClick={() => open({ type: 'cancel', item })}>
          <XCircle />
          <span>Cancelar</span>
        </button>
      )}
    </div>
  )
}
function Reports({ data }) {
  const [query, setQuery] = useState('')
  const [movementType, setMovementType] = useState('Todos')
  const [registeredBy, setRegisteredBy] = useState('Todos')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [reportPage, setReportPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const movements = data.movimientos || []
  const normalize = (value) =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const dateInfo = (value) => {
    const date = new Date(value),
      pad = (number) => String(number).padStart(2, '0')
    return {
      key: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
      date: date.toLocaleDateString('es-PE'),
      time: date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    }
  }
  const movementClass = (value) => normalize(value).replace(/\s+/g, '-')
  const types = [...new Set(movements.map((item) => item.tipo))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
  const users = [...new Set(movements.map((item) => item.usuario || 'Sistema'))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )
  const search = normalize(query.trim())
  const rows = movements.filter((item) => {
    const key = dateInfo(item.fechaUtc).key
    const searchable = normalize(
      `${item.equipo} ${item.codigoPatrimonial} ${item.usuario || 'Sistema'} ${item.tipo} ${item.descripcion}`,
    )
    return (
      (!search || searchable.includes(search)) &&
      (movementType === 'Todos' || item.tipo === movementType) &&
      (registeredBy === 'Todos' || (item.usuario || 'Sistema') === registeredBy) &&
      (!from || key >= from) &&
      (!to || key <= to)
    )
  })
  const pageRows = rows.slice((reportPage - 1) * 7, reportPage * 7)
  const hasFilters = Boolean(
    query || movementType !== 'Todos' || registeredBy !== 'Todos' || from || to,
  )
  const update = (setter, value) => {
    setter(value)
    setReportPage(1)
  }
  const clearFilters = () => {
    setQuery('')
    setMovementType('Todos')
    setRegisteredBy('Todos')
    setFrom('')
    setTo('')
    setReportPage(1)
  }

  return (
    <>
      <section className="panel reports-table-panel">
        <PanelTitle
          title="Reportes de movimientos"
          subtitle="Busca y filtra las operaciones realizadas sobre los equipos tecnológicos"
        />
        <div className="report-filter-panel">
          <div className="report-filter-main">
            <label className="report-search">
              <span>Buscar en el historial</span>
              <div>
                <Search />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => update(setQuery, event.target.value)}
                  placeholder="Equipo, código, usuario o descripción"
                />
              </div>
            </label>
            <SelectInput
              label="Movimiento"
              value={movementType}
              onChange={(event) => update(setMovementType, event.target.value)}
            >
              <option value="Todos">Todos los movimientos</option>
              {types.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </SelectInput>
            <SelectInput
              label="Registrado por"
              value={registeredBy}
              onChange={(event) => update(setRegisteredBy, event.target.value)}
            >
              <option value="Todos">Todos los usuarios</option>
              {users.map((user) => (
                <option key={user}>{user}</option>
              ))}
            </SelectInput>
          </div>
          <div className="report-filter-dates">
            <div className="report-filter-heading">
              <History />
              <div>
                <strong>Periodo del movimiento</strong>
                <span>Usa las fechas solo cuando necesites acotar más la búsqueda</span>
              </div>
            </div>
            <DateInput
              label="Desde"
              name="reportFrom"
              value={from}
              max={to || undefined}
              onChange={(event) => update(setFrom, event.target.value)}
            />
            <DateInput
              label="Hasta"
              name="reportTo"
              value={to}
              min={from || undefined}
              onChange={(event) => update(setTo, event.target.value)}
            />
            <Button type="button" variant="secondary" onClick={clearFilters} disabled={!hasFilters}>
              Limpiar filtros
            </Button>
          </div>
        </div>
        <TableList
          rows={pageRows}
          columns={[
            {
              key: 'fecha',
              label: 'Fecha y hora',
              render: (item) => {
                const info = dateInfo(item.fechaUtc)
                return (
                  <>
                    <strong>{info.date}</strong>
                    <small>{info.time}</small>
                  </>
                )
              },
            },
            {
              key: 'tipo',
              label: 'Movimiento',
              render: (item) => (
                <span className={`movement-type ${movementClass(item.tipo)}`}>{item.tipo}</span>
              ),
            },
            {
              key: 'equipo',
              label: 'Equipo',
              render: (item) => (
                <>
                  <strong>{item.equipo}</strong>
                  <small>{item.codigoPatrimonial}</small>
                </>
              ),
            },
            {
              key: 'usuario',
              label: 'Registrado por',
              render: (item) => item.usuario || 'Sistema',
            },
            {
              key: 'acciones',
              label: 'Acciones',
              render: (item) => (
                <button className="action-button edit" onClick={() => setSelected(item)}>
                  <Eye />
                  <span>Ver detalle</span>
                </button>
              ),
            },
          ]}
        />
        {!rows.length && (
          <div className="report-table-empty">
            <Search />
            <strong>No se encontraron movimientos</strong>
            <span>Revisa el texto escrito o limpia alguno de los filtros.</span>
          </div>
        )}
        <Pagination
          page={reportPage}
          total={rows.length}
          pageSize={7}
          onChange={setReportPage}
          itemLabel="movimientos"
        />
      </section>
      {selected && (
        <ModalConfirmacion
          title="Detalle del movimiento"
          subtitle={`${selected.tipo} · ${selected.codigoPatrimonial}`}
          className="management-modal report-detail-modal"
          onClose={() => setSelected(null)}
        >
          <div className="detail-grid">
            {(() => {
              const info = dateInfo(selected.fechaUtc)
              return (
                <>
                  <Detail label="Fecha" value={info.date} />
                  <Detail label="Hora exacta" value={info.time} />
                </>
              )
            })()}
            <Detail
              label="Tipo de movimiento"
              value={
                <span className={`movement-type ${movementClass(selected.tipo)}`}>
                  {selected.tipo}
                </span>
              }
            />
            <Detail label="Registrado por" value={selected.usuario || 'Sistema'} />
            <Detail label="Equipo" value={selected.equipo} />
            <Detail label="Código patrimonial" value={selected.codigoPatrimonial} />
            <Detail label="Descripción" value={selected.descripcion} wide />
          </div>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setSelected(null)}>
              Cerrar
            </Button>
          </div>
        </ModalConfirmacion>
      )}
    </>
  )
}
function ListPanel({
  title,
  subtitle,
  action,
  search,
  setSearch,
  placeholder,
  filter,
  setFilter,
  options,
  label,
  page,
  setPage,
  total,
  itemLabel,
  children,
  assets,
}) {
  return (
    <section className={`panel ${assets ? 'asset-panel' : ''}`}>
      <PanelTitle title={title} subtitle={subtitle} action={action} />
      <ListFilters
        search={search}
        onSearch={setSearch}
        placeholder={placeholder}
        filters={[
          {
            key: 'filter',
            label,
            value: filter,
            onChange: (value) => {
              setFilter(value)
              setPage(1)
            },
            options,
          },
        ]}
      />
      {children}
      <Pagination
        page={page}
        total={total}
        pageSize={assets ? 6 : 7}
        onChange={setPage}
        itemLabel={itemLabel}
      />
    </section>
  )
}

function Modals({ modal, errors, setErrors, saving, close, open, submit }) {
  if (!modal) return null
  const error = errors.general && <FormError message={errors.general} />
  if (modal.type === 'user')
    return (
      <ModalConfirmacion
        title={modal.item ? 'Editar usuario' : 'Nuevo usuario'}
        subtitle="Datos de identificación y acceso"
        className="management-modal"
        onClose={close}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget,
              f = new FormData(form),
              payload = {
                nombres: f.get('nombres').trim(),
                apellidos: f.get('apellidos').trim(),
                area: f.get('area').trim(),
                correo: f.get('correo').trim().toLowerCase(),
                rol: f.get('rol'),
                activo: modal.item?.activo ?? true,
                ...(!modal.item ? { password: f.get('password') } : {}),
              },
              fieldErrors = {}
            if (payload.nombres.length < 3) fieldErrors.nombres = 'Ingrese su nombre.'
            if (payload.apellidos.length < 3) fieldErrors.apellidos = 'Ingrese sus apellidos.'
            if (!institutionalEmail.test(payload.correo))
              fieldErrors.correo = 'Usa un correo institucional @innovatech.com.'
            if (payload.area.length < 2) fieldErrors.area = 'Ingresa un área válida.'
            if (!modal.item && !strongPassword.test(payload.password))
              fieldErrors.password =
                'Debe incluir 8 caracteres, mayúscula, minúscula, número y símbolo.'
            if (!showValidation(form, fieldErrors, setErrors)) return
            submit(
              () =>
                request(modal.item ? `/usuarios/${modal.item.id}` : '/usuarios', {
                  method: modal.item ? 'PUT' : 'POST',
                  body: JSON.stringify(payload),
                }),
              modal.item
                ? 'Usuario actualizado correctamente.'
                : 'Usuario registrado correctamente.',
            )
          }}
        >
          {error}
          <div className="form-grid">
            <TextInput
              label="Nombres"
              name="nombres"
              minLength="3"
              defaultValue={modal.item?.nombres || ''}
              error={errors.nombres}
            />
            <TextInput
              label="Apellidos"
              name="apellidos"
              minLength="3"
              defaultValue={modal.item?.apellidos || ''}
              error={errors.apellidos}
            />
          </div>
          <TextInput
            label="Correo institucional"
            name="correo"
            type="email"
            defaultValue={modal.item?.correo || ''}
            placeholder="usuario@innovatech.com"
            error={errors.correo}
          />
          <TextInput
            label="Área"
            name="area"
            defaultValue={modal.item?.area || ''}
            placeholder="Ej.: Contabilidad"
            error={errors.area}
          />
          <SelectInput label="Rol" name="rol" defaultValue={modal.item?.rol || 'Colaborador'}>
            <option>Colaborador</option>
            <option>Responsable de Tecnología</option>
            <option>Administrador</option>
          </SelectInput>
          {!modal.item && (
            <PasswordInput
              label="Contraseña temporal"
              name="password"
              placeholder="TechAsset2026*"
              error={errors.password}
            />
          )}{' '}
          {modal.item ? (
            <div className="form-note">
              <AlertCircle />
              <span>El correo institucional debe seguir siendo único.</span>
            </div>
          ) : (
            <RuleNotice
              title="Datos para el registro"
              items={[
                'El correo institucional debe ser único.',
                'La contraseña debe incluir mayúscula, minúscula, número, símbolo y 8 caracteres como mínimo.',
                'Registra el área real del usuario para mantener correctos los reportes por área.',
              ]}
            />
          )}
          <Actions saving={saving} close={close} />
        </form>
      </ModalConfirmacion>
    )
  if (modal.type === 'disable-user')
    return (
      <ModalConfirmacion
        title="Deshabilitar usuario"
        subtitle="Confirma la desactivación de la cuenta"
        className="decision-modal"
        onClose={close}
      >
        {error}
        <p className="decision-copy">
          La cuenta de <strong>{modal.item.nombreCompleto}</strong> perderá el acceso al sistema.
          Sus registros históricos se conservarán.
        </p>
        <Actions
          saving={saving}
          close={close}
          text="Deshabilitar usuario"
          danger
          onClick={() =>
            submit(
              () => request(`/usuarios/${modal.item.id}/deshabilitar`, { method: 'PATCH' }),
              'Usuario deshabilitado correctamente.',
            )
          }
        />
      </ModalConfirmacion>
    )
  if (modal.type === 'delete-equipment')
    return (
      <ModalConfirmacion
        title="Eliminar equipo"
        subtitle={`${modal.item.nombre} · ${modal.item.codigoPatrimonial}`}
        className="decision-modal delete-equipment-modal"
        onClose={close}
      >
        {error}
        <div className="delete-warning">
          <Trash2 />
          <div>
            <strong>Esta acción es permanente</strong>
            <p>
              Elimina el equipo únicamente si fue registrado por error. Después no podrás
              recuperarlo.
            </p>
          </div>
        </div>
        <Actions
          saving={saving}
          close={close}
          text="Sí, eliminar equipo"
          danger
          onClick={() =>
            submit(
              () => request(`/equipos/${modal.item.id}`, { method: 'DELETE' }),
              'Equipo eliminado correctamente.',
            )
          }
        />
      </ModalConfirmacion>
    )
  if (modal.type === 'equipment')
    return (
      <EquipmentForm
        item={modal.item}
        errors={errors}
        setErrors={setErrors}
        error={error}
        saving={saving}
        close={close}
        open={open}
        submit={submit}
      />
    )
  if (modal.type === 'loan')
    return (
      <ModalConfirmacion
        title="Solicitar préstamo"
        subtitle={`${modal.item.nombre} · ${modal.item.codigoPatrimonial}`}
        className="management-modal"
        onClose={close}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget,
              f = new FormData(form),
              payload = {
                equipoId: modal.item.id,
                fechaPrestamo: f.get('inicio'),
                fechaDevolucionProgramada: f.get('fin'),
                motivo: f.get('motivo').trim(),
              },
              fieldErrors = {}
            if (!payload.fechaPrestamo || payload.fechaPrestamo < today())
              fieldErrors.inicio = 'Selecciona hoy o una fecha posterior.'
            if (
              !payload.fechaDevolucionProgramada ||
              payload.fechaDevolucionProgramada <= payload.fechaPrestamo
            )
              fieldErrors.fin =
                'La devolución debe ser posterior al préstamo; no puede ser el mismo día.'
            if (payload.motivo.length < 5)
              fieldErrors.motivo = 'Explica el motivo con al menos 5 caracteres.'
            if (!showValidation(form, fieldErrors, setErrors)) return
            submit(
              () => request('/prestamos', { method: 'POST', body: JSON.stringify(payload) }),
              'Solicitud registrada correctamente. Puedes consultar su estado en Mis préstamos.',
            )
          }}
        >
          {error}
          <div className="form-grid">
            <DateInput
              label="Fecha de préstamo"
              name="inicio"
              min={today()}
              defaultValue={today()}
              error={errors.inicio}
            />
            <DateInput
              label="Devolución programada"
              name="fin"
              min={nextDay(today())}
              error={errors.fin}
            />
          </div>
          <Area
            label="Motivo"
            name="motivo"
            placeholder="Describe para qué necesitas el equipo"
            error={errors.motivo}
          />
          <RuleNotice
            title="Antes de enviar"
            items={[
              'La devolución debe ser posterior al préstamo; no se admite el mismo día.',
              'Describe brevemente para qué utilizarás el equipo.',
            ]}
          />
          <Actions saving={saving} close={close} text="Enviar solicitud" />
        </form>
      </ModalConfirmacion>
    )
  if (modal.type === 'return')
    return (
      <ModalConfirmacion
        title="Registrar devolución"
        subtitle={`${modal.item.equipo} · ${modal.item.codigoPatrimonial}`}
        className="management-modal"
        onClose={close}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget,
              f = new FormData(form),
              payload = {
                fechaDevolucion: f.get('fecha'),
                observacion: f.get('observacion').trim(),
              },
              fieldErrors = {}
            if (!payload.fechaDevolucion || payload.fechaDevolucion <= modal.item.fechaPrestamo)
              fieldErrors.fecha =
                'Debe ser posterior a la fecha del préstamo; no puede ser el mismo día.'
            else if (payload.fechaDevolucion > today())
              fieldErrors.fecha = 'La devolución no puede registrarse en el futuro.'
            if (payload.observacion.length < 5)
              fieldErrors.observacion =
                'La observación es obligatoria; describe la devolución con al menos 5 caracteres.'
            if (!showValidation(form, fieldErrors, setErrors)) return
            submit(
              () =>
                request(`/prestamos/${modal.item.id}/devolucion`, {
                  method: 'POST',
                  body: JSON.stringify(payload),
                }),
              'Devolución registrada; el equipo vuelve a estar disponible.',
            )
          }}
        >
          {error}
          <DateInput
            label="Fecha de devolución"
            name="fecha"
            min={nextDay(modal.item.fechaPrestamo)}
            max={today()}
            defaultValue={today()}
            error={errors.fecha}
          />
          <Area
            label="Observaciones obligatorias"
            name="observacion"
            placeholder="Estado físico, accesorios entregados e incidencias"
            error={errors.observacion}
          />
          <RuleNotice
            title="Condiciones de devolución"
            items={[
              'La fecha debe ser posterior al préstamo y no puede ser futura.',
              'La observación es obligatoria: registra el estado físico, accesorios o incidencias.',
            ]}
          />
          <Actions saving={saving} close={close} text="Registrar devolución" />
        </form>
      </ModalConfirmacion>
    )
  if (modal.type === 'reject')
    return (
      <Decision title="Rechazar solicitud" item={modal.item} error={error} close={close}>
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.currentTarget,
              f = new FormData(form),
              observacion = f.get('observacion').trim(),
              fieldErrors = {}
            if (observacion.length < 5)
              fieldErrors.observacion = 'Explica el rechazo con al menos 5 caracteres.'
            if (!showValidation(form, fieldErrors, setErrors)) return
            submit(
              () =>
                request(`/prestamos/${modal.item.id}/rechazar`, {
                  method: 'PATCH',
                  body: JSON.stringify({ observacion }),
                }),
              'Solicitud rechazada con observación.',
            )
          }}
        >
          <Area label="Motivo del rechazo" name="observacion" error={errors.observacion} />
          <Actions saving={saving} close={close} text="Confirmar rechazo" danger />
        </form>
      </Decision>
    )
  if (modal.type === 'approve')
    return (
      <Decision title="Aprobar préstamo" item={modal.item} error={error} close={close}>
        <p className="decision-copy">
          Se validará nuevamente que el equipo siga disponible. Al aprobarse quedará marcado como{' '}
          <strong>Prestado</strong>.
        </p>
        <Actions
          saving={saving}
          close={close}
          text="Aprobar y asignar"
          onClick={() =>
            submit(
              () => request(`/prestamos/${modal.item.id}/aprobar`, { method: 'PATCH' }),
              'Préstamo aprobado y equipo asignado.',
            )
          }
        />
      </Decision>
    )
  if (modal.type === 'cancel')
    return (
      <Decision title="Cancelar solicitud" item={modal.item} error={error} close={close}>
        <p className="decision-copy">La solicitud quedará en el historial con estado Cancelado.</p>
        <Actions
          saving={saving}
          close={close}
          text="Sí, cancelar"
          danger
          onClick={() =>
            submit(
              () => request(`/prestamos/${modal.item.id}/cancelar`, { method: 'PATCH' }),
              'Solicitud cancelada.',
            )
          }
        />
      </Decision>
    )
  return (
    <ModalConfirmacion
      title="Detalle del préstamo"
      subtitle={modal.item.codigoPatrimonial}
      className="management-modal"
      onClose={close}
    >
      {error}
      <div className="detail-grid">
        <Detail label="Equipo" value={modal.item.equipo} />
        <Detail label="Colaborador" value={modal.item.colaborador} />
        <Detail label="Área" value={modal.item.area} />
        <Detail label="Estado" value={<Estado value={modal.item.estado} />} />
        <Detail label="Préstamo" value={modal.item.fechaPrestamo} />
        <Detail label="Devolución programada" value={modal.item.fechaDevolucionProgramada} />
        <Detail label="Responsable" value={modal.item.responsable || 'Asignación pendiente'} />
        {modal.item.fechaDevolucion && (
          <Detail label="Devolución registrada" value={modal.item.fechaDevolucion} />
        )}
        <Detail label="Motivo" value={modal.item.motivo} wide />
        {modal.item.observacion && (
          <Detail label="Observación" value={modal.item.observacion} wide />
        )}
      </div>
      <div className="modal-actions">
        <Button variant="secondary" onClick={close}>
          Cerrar
        </Button>
      </div>
    </ModalConfirmacion>
  )
}
function EquipmentForm({ item, errors, setErrors, error, saving, close, open, submit }) {
  const categories = [
    'Laptop',
    'Computadora de escritorio',
    'Monitor',
    'Impresora',
    'Tablet',
    'Proyector multimedia',
    'Equipo de red',
  ]
  const knownCategory = categories.includes(item?.categoria)
  const [category, setCategory] = useState(
    item?.categoria ? (knownCategory ? item.categoria : 'Otra') : 'Laptop',
  )
  const isLoaned = item?.estado === 'Prestado'
  const canDelete = Boolean(item && !item.tieneHistorial && !isLoaned)
  const inventoryTips = isLoaned
    ? null
    : item?.tieneHistorial
      ? ['Si el equipo deja de utilizarse, cambia su estado a Baja para conservar el historial.']
      : [
          'Usa Mantenimiento cuando el equipo estará temporalmente fuera de servicio.',
          'Usa Baja únicamente cuando el equipo ya no formará parte del inventario operativo.',
        ]

  const save = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const values = new FormData(form)
    const selectedCategory = category === 'Otra' ? values.get('otraCategoria').trim() : category
    const payload = {
      codigoPatrimonial: values.get('codigo').trim().toUpperCase(),
      nombre: values.get('nombre').trim(),
      categoria: selectedCategory,
      marca: values.get('marca').trim(),
      estado: values.get('estado'),
    }
    const fieldErrors = {}
    if (payload.codigoPatrimonial.length < 3)
      fieldErrors.codigo = 'El código patrimonial debe tener al menos 3 caracteres.'
    if (payload.nombre.length < 2) fieldErrors.nombre = 'Ingresa al menos 2 caracteres.'
    if (payload.categoria.length < 2) fieldErrors.otraCategoria = 'Especifica una categoría válida.'
    if (payload.marca.length < 2) fieldErrors.marca = 'Ingresa una marca válida.'
    if (!showValidation(form, fieldErrors, setErrors)) return
    submit(
      () =>
        request(item ? `/equipos/${item.id}` : '/equipos', {
          method: item ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }),
      item ? 'Equipo actualizado correctamente.' : 'Equipo registrado correctamente.',
    )
  }

  return (
    <ModalConfirmacion
      title={item ? 'Editar equipo' : 'Nuevo equipo'}
      subtitle="Información patrimonial del activo"
      className="management-modal"
      onClose={close}
    >
      <form noValidate onSubmit={save}>
        {error}
        <div className="form-guide">
          <Boxes />
          <div>
            <strong>Inventario tecnológico</strong>
            <span>El código patrimonial es único y no puede repetirse.</span>
          </div>
        </div>
        <TextInput
          label="Código patrimonial"
          name="codigo"
          defaultValue={item?.codigoPatrimonial || ''}
          placeholder="INV-LAP-004"
          error={errors.codigo}
        />
        <TextInput
          label="Nombre del equipo"
          name="nombre"
          defaultValue={item?.nombre || ''}
          placeholder="Laptop Lenovo ThinkPad"
          error={errors.nombre}
        />
        <div className="form-grid equipment-taxonomy">
          <SelectInput
            label="Categoría"
            name="categoriaSelector"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="Laptop">Laptop</option>
            <option value="Computadora de escritorio">Computadora de escritorio</option>
            <option value="Monitor">Monitor</option>
            <option value="Impresora">Impresora</option>
            <option value="Tablet">Tablet</option>
            <option value="Proyector multimedia">Proyector multimedia</option>
            <option value="Equipo de red">Equipo de red</option>
            <option value="Otra">Otra categoría</option>
          </SelectInput>
          <TextInput
            label="Marca"
            name="marca"
            list="equipment-brand-options"
            defaultValue={item?.marca || ''}
            placeholder="Ej.: Lenovo"
            error={errors.marca}
          />
        </div>
        {category === 'Otra' && (
          <TextInput
            label="Especificar categoría"
            name="otraCategoria"
            defaultValue={knownCategory ? '' : item?.categoria || ''}
            placeholder="Escribe la categoría del equipo"
            error={errors.otraCategoria}
          />
        )}
        <datalist id="equipment-brand-options">
          <option value="Lenovo" />
          <option value="Dell" />
          <option value="HP" />
          <option value="ASUS" />
          <option value="Acer" />
          <option value="Apple" />
          <option value="Samsung" />
          <option value="LG" />
          <option value="Epson" />
          <option value="Cisco" />
        </datalist>
        {isLoaned ? (
          <label className="field locked-status-field">
            <span>Estado</span>
            <input type="hidden" name="estado" value="Prestado" />
            <div aria-label="Estado Prestado bloqueado">
              <LockKeyhole />
              Prestado<strong>Bloqueado mientras exista un préstamo activo</strong>
            </div>
          </label>
        ) : (
          <SelectInput label="Estado" name="estado" defaultValue={item?.estado || 'Disponible'}>
            <option>Disponible</option>
            <option>Mantenimiento</option>
            <option>Baja</option>
          </SelectInput>
        )}
        {inventoryTips && <RuleNotice title="Uso de los estados" items={inventoryTips} />}
        <div className={`modal-actions ${canDelete ? 'with-delete' : ''}`}>
          {canDelete && (
            <Button
              type="button"
              variant="danger"
              onClick={() => open({ type: 'delete-equipment', item })}
            >
              <Trash2 />
              Eliminar equipo
            </Button>
          )}
          <span className="modal-actions-spacer" />
          <Button type="button" variant="secondary" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            <Save />
            {saving ? 'Procesando…' : 'Guardar cambios'}
          </Button>
        </div>
      </form>
    </ModalConfirmacion>
  )
}
function Decision({ title, item, error, close, children }) {
  return (
    <ModalConfirmacion
      title={title}
      subtitle="Confirma la acción antes de continuar"
      className="decision-modal"
      onClose={close}
    >
      {error}
      <div className="decision-summary">
        <Detail label="Equipo" value={`${item.equipo} · ${item.codigoPatrimonial}`} wide />
        <Detail label="Colaborador" value={item.colaborador} />
        <Detail
          label="Periodo"
          value={`${item.fechaPrestamo} a ${item.fechaDevolucionProgramada}`}
        />
      </div>
      {children}
    </ModalConfirmacion>
  )
}
function Actions({ saving, close, text = 'Guardar cambios', danger, onClick }) {
  return (
    <div className="modal-actions">
      <Button type="button" variant="secondary" onClick={close}>
        Cancelar
      </Button>
      <Button
        type={onClick ? 'button' : 'submit'}
        variant={danger ? 'danger' : 'primary'}
        disabled={saving}
        onClick={onClick}
      >
        <Save />
        {saving ? 'Procesando…' : text}
      </Button>
    </div>
  )
}
function Area({ label, error, ...props }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      <textarea rows="4" aria-invalid={Boolean(error)} {...props} />
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  )
}
function PanelTitle({ title, subtitle, action }) {
  return (
    <div className="panel-title">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}
function Detail({ label, value, wide }) {
  return (
    <div className={wide ? 'wide' : ''}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
function FormError({ message }) {
  return (
    <div className="form-banner-error" role="alert">
      <AlertCircle />
      <span>{message}</span>
    </div>
  )
}
function RuleNotice({ title, items }) {
  return (
    <div className="rule-notice">
      <AlertCircle />
      <div>
        <strong>{title}</strong>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
