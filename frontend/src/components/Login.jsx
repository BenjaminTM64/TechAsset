import { useMemo, useRef, useState } from 'react'
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  Headphones,
  Info,
  KeyRound,
  Laptop,
  LockKeyhole,
  LogIn,
  Mail,
  MailCheck,
  Network,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Workflow,
  X,
  XCircle,
} from 'lucide-react'

const EMAIL_DOMAIN = '@innovatech.com'

function evaluateEmail(rawValue, required = false) {
  const value = rawValue.trim().toLowerCase()
  if (!value) {
    return required
      ? { type: 'error', message: 'El correo corporativo es obligatorio.' }
      : { type: 'idle', message: 'Ingresa tu cuenta oficial de colaborador o responsable de TI.' }
  }
  const atIndex = value.indexOf('@')
  if (atIndex < 1)
    return {
      type: 'warning',
      message: `Completa el correo con el dominio corporativo ${EMAIL_DOMAIN}.`,
    }
  const localPart = value.slice(0, atIndex)
  const domainPart = value.slice(atIndex + 1)
  const expectedDomain = EMAIL_DOMAIN.slice(1)
  if (!/^[a-z0-9._%+-]+$/i.test(localPart) || value.indexOf('@', atIndex + 1) !== -1) {
    return { type: 'error', message: 'El formato del correo no es válido.' }
  }
  if (expectedDomain.startsWith(domainPart) && domainPart !== expectedDomain) {
    return { type: 'warning', message: `Dominio incompleto. Debe terminar en ${EMAIL_DOMAIN}.` }
  }
  if (domainPart !== expectedDomain) {
    return { type: 'error', message: `Ese dominio no pertenece a Innovatech. Usa ${EMAIL_DOMAIN}.` }
  }
  return { type: 'success', message: 'Correo corporativo válido.' }
}

export default function Login({
  onSubmit,
  onForgotPassword,
  onResetPassword,
  forcePasswordChange = false,
  accountEmail = '',
  onChangePassword,
  loading,
  notice,
  close,
  onBackToLanding,
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [accessAttempted, setAccessAttempted] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [localAlert, setLocalAlert] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const resetToken = new URLSearchParams(window.location.search).get('resetToken')
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login')

  // Los campos vacíos solo se marcan como obligatorios después de intentar enviar el formulario.
  const emailRequired = mode === 'login' ? accessAttempted : emailTouched
  const emailFeedback = useMemo(() => evaluateEmail(email, emailRequired), [email, emailRequired])
  const passwordMissing = accessAttempted && !passwordRef.current?.value
  const displayedNotice = localAlert ? { type: 'error', message: localAlert } : notice
  const passwordChecks = [
    { label: 'Mínimo 8 caracteres', valid: newPassword.length >= 8 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(newPassword) },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(newPassword) },
    { label: 'Un número', valid: /[0-9]/.test(newPassword) },
    { label: 'Un símbolo (!, @, #, *)', valid: /[^A-Za-z0-9]/.test(newPassword) },
  ]
  const passwordValid = passwordChecks.every((item) => item.valid)
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === newPassword
  const passwordFormValid = passwordValid && passwordsMatch

  const clearMessages = () => {
    setLocalAlert('')
    close?.()
  }
  const validateAccessForm = (event, handler) => {
    setAccessAttempted(true)
    const emailResult = evaluateEmail(email, true)
    const password = passwordRef.current?.value || ''
    if (emailResult.type !== 'success' || !password) {
      event.preventDefault()
      setLocalAlert('Revisa y completa los campos obligatorios antes de continuar.')
      if (emailResult.type !== 'success') emailRef.current?.focus()
      else passwordRef.current?.focus()
      return
    }
    setLocalAlert('')
    handler(event)
  }
  const validateRecoveryForm = (event) => {
    setEmailTouched(true)
    if (evaluateEmail(email, true).type !== 'success') {
      event.preventDefault()
      setLocalAlert(`Ingresa un correo corporativo válido terminado en ${EMAIL_DOMAIN}.`)
      emailRef.current?.focus()
      return
    }
    setLocalAlert('')
    onForgotPassword(event)
  }
  const changeMode = (nextMode) => {
    clearMessages()
    setEmailTouched(false)
    setAccessAttempted(false)
    setMode(nextMode)
  }
  const heading = forcePasswordChange
    ? ['Protege tu cuenta', 'Reemplaza la contraseña temporal antes de continuar.']
    : mode === 'forgot'
      ? ['Recupera tu acceso', 'Te enviaremos un enlace seguro a tu correo corporativo.']
      : mode === 'reset'
        ? ['Crea una nueva contraseña', 'El enlace es de un solo uso y vence en 30 minutos.']
        : [
            'Acceso a TechAsset',
            'Ingresa con tus credenciales para administrar inventario o solicitar equipos tecnológicos.',
          ]

  return (
    <main className="ta-login-page" id="main-content">
      <a className="skip-link" href="#login-form">
        Saltar al formulario de acceso
      </a>
      <section className="ta-login-hero" aria-label="Presentación de TechAsset">
        <img
          className="ta-login-hero-image"
          src="/techasset-hero.jpg"
          alt="Colaboradores y activos tecnológicos de Innovatech Solutions"
        />
        <div className="ta-login-hero-overlay" />
        <header className="ta-login-hero-top">
          <span className="ta-hero-badge">
            <Network />
            Gestión de Inventario &amp; Préstamos TI
          </span>
          <span className="ta-company-badge">Innovatech Solutions S.A.C.</span>
        </header>
        <div className="ta-login-hero-content">
          <span className="ta-context-pill">
            <PackageCheck />
            Control Integral de Activos Tecnológicos
          </span>
          <h1>TechAsset</h1>
          <p>
            Sistema corporativo de administración de inventario de equipos (laptops, estaciones de
            trabajo, proyectores y redes) y asignación controlada de préstamos para colaboradores.
          </p>
          <div className="ta-feature-pills" aria-label="Funciones principales">
            <span>
              <Laptop className="cyan" />
              Laptops y Estaciones
            </span>
            <span>
              <RefreshCw className="green" />
              Préstamos y Devoluciones
            </span>
            <span>
              <Workflow className="amber" />
              Trazabilidad en Tiempo Real
            </span>
          </div>
        </div>
        <footer className="ta-login-hero-footer">
          <span>
            <Network />
            Gerencia de Tecnología · Más de 500 Colaboradores
          </span>
          <span>TechAsset v1.0 · 2026</span>
        </footer>
      </section>

      <section className="ta-login-auth-panel">
        <div className="ta-login-form-wrap">
          <header className="ta-login-heading">
            <img src="/techasset-logo.png" alt="TechAsset - Innovatech Solutions S.A.C." />
            <h2>{heading[0]}</h2>
            <p>{heading[1]}</p>
          </header>
          <LoginAlert
            notice={displayedNotice}
            onClose={() => {
              setLocalAlert('')
              close?.()
            }}
          />

          {forcePasswordChange ? (
            <PasswordChangeForm
              id="login-form"
              accountEmail={accountEmail}
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              checks={passwordChecks}
              passwordsMatch={passwordsMatch}
              valid={passwordFormValid}
              submitText="Guardar nueva contraseña"
              onSubmit={(event) => {
                if (!passwordFormValid) {
                  event.preventDefault()
                  return
                }
                onChangePassword(event)
              }}
            />
          ) : mode === 'forgot' ? (
            <form
              id="login-form"
              className="ta-login-form"
              noValidate
              onSubmit={validateRecoveryForm}
            >
              <EmailField
                inputRef={emailRef}
                value={email}
                onChange={(value) => {
                  setEmail(value)
                  setEmailTouched(false)
                  clearMessages()
                }}
                feedback={emailFeedback}
              />
              <SubmitButton
                loading={loading}
                icon={MailCheck}
                idleText="Enviar enlace de recuperación"
                loadingText="Enviando enlace…"
              />
              <button className="ta-login-back" type="button" onClick={() => changeMode('login')}>
                Volver al inicio de sesión
              </button>
            </form>
          ) : mode === 'reset' ? (
            <PasswordChangeForm
              id="login-form"
              loading={loading}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              checks={passwordChecks}
              passwordsMatch={passwordsMatch}
              valid={passwordFormValid}
              submitText="Restablecer contraseña"
              onSubmit={async (event) => {
                if (!passwordFormValid) {
                  event.preventDefault()
                  return
                }
                if (await onResetPassword(event, resetToken)) changeMode('login')
              }}
              onBack={() => {
                window.history.replaceState({}, '', window.location.pathname)
                changeMode('login')
              }}
            />
          ) : (
            <form
              id="login-form"
              className="ta-login-form"
              noValidate
              onSubmit={(event) => validateAccessForm(event, onSubmit)}
            >
              <EmailField
                inputRef={emailRef}
                value={email}
                onChange={(value) => {
                  setEmail(value)
                  setAccessAttempted(false)
                  clearMessages()
                }}
                feedback={emailFeedback}
              />
              <label className={`ta-field ${passwordMissing ? 'error' : ''}`}>
                <span className="ta-field-label">
                  <b>
                    Contraseña <i aria-hidden="true">*</i>
                  </b>
                  {capsLock && (
                    <em className="ta-caps-warning">
                      <CircleAlert />
                      Mayúsculas activadas
                    </em>
                  )}
                </span>
                <span className="ta-input-wrap">
                  <LockKeyhole />
                  <input
                    ref={passwordRef}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    onChange={() => {
                      setAccessAttempted(false)
                      clearMessages()
                    }}
                    onKeyUp={(event) => setCapsLock(Boolean(event.getModifierState?.('CapsLock')))}
                    aria-invalid={passwordMissing}
                    aria-describedby={passwordMissing ? 'password-feedback' : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="ta-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </span>
                {passwordMissing && (
                  <small id="password-feedback" className="ta-field-feedback error" role="alert">
                    <XCircle />
                    La contraseña corporativa es obligatoria.
                  </small>
                )}
              </label>
              <div className="ta-login-options">
                <label>
                  <input name="recordar" type="checkbox" />
                  Recordar en este equipo
                </label>
                <button type="button" onClick={() => changeMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <SubmitButton
                loading={loading}
                icon={LogIn}
                idleText="Ingresar a TechAsset"
                loadingText="Validando credenciales…"
              />
              {onBackToLanding && (
                <button className="ta-login-back" type="button" onClick={onBackToLanding}>
                  Volver a la página principal
                </button>
              )}
            </form>
          )}
          <footer className="ta-login-support">
            <span>
              <Headphones />
              Mesa de Ayuda TI: Anexo 2100
            </span>
            <em>
              <BadgeCheck />
              Conexión segura
            </em>
          </footer>
        </div>
      </section>
    </main>
  )
}

function EmailField({ inputRef, value, onChange, onBlur, feedback }) {
  const StatusIcon =
    feedback.type === 'success'
      ? CheckCircle2
      : feedback.type === 'error'
        ? XCircle
        : feedback.type === 'warning'
          ? Info
          : null
  return (
    <label className={`ta-field ${feedback.type}`}>
      <span className="ta-field-label">
        <b>
          Correo corporativo <i aria-hidden="true">*</i>
        </b>
        <em className="ta-domain-badge">{EMAIL_DOMAIN}</em>
      </span>
      <span className="ta-input-wrap">
        <Mail />
        <input
          ref={inputRef}
          name="correo"
          type="email"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={`usuario${EMAIL_DOMAIN}`}
          autoComplete="username"
          aria-invalid={feedback.type === 'error'}
          aria-describedby="email-feedback"
          required
        />
        {StatusIcon && <StatusIcon className="ta-status-icon" aria-hidden="true" />}
      </span>
      <small
        id="email-feedback"
        className={`ta-field-feedback ${feedback.type}`}
        aria-live="polite"
      >
        {StatusIcon && <StatusIcon />}
        {feedback.message}
      </small>
    </label>
  )
}

function SubmitButton({ loading, icon: Icon, idleText, loadingText }) {
  return (
    <button className="ta-login-submit" type="submit" disabled={loading}>
      {loading ? <RefreshCw className="spin" /> : <Icon />}
      {loading ? loadingText : idleText}
    </button>
  )
}

function LoginAlert({ notice, onClose }) {
  if (!notice?.message) return null
  const success = notice.type === 'success'
  const Icon = success ? CheckCircle2 : CircleAlert
  return (
    <div
      className={`ta-general-alert ${success ? 'success' : 'error'}`}
      role={success ? 'status' : 'alert'}
      aria-live={success ? 'polite' : 'assertive'}
    >
      <Icon />
      <div>
        <strong>{success ? 'Operación completada' : 'No se pudo continuar'}</strong>
        <span>{notice.message}</span>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar mensaje">
          <X />
        </button>
      )}
    </div>
  )
}

function PasswordChangeForm({
  id,
  accountEmail,
  loading,
  showPassword,
  setShowPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  checks,
  passwordsMatch,
  valid,
  submitText,
  onSubmit,
  onBack,
}) {
  return (
    <form id={id} className="ta-login-form" noValidate onSubmit={onSubmit}>
      {accountEmail && (
        <div className="ta-security-note">
          <KeyRound />
          <div>
            <strong>Primer ingreso</strong>
            <span>{accountEmail}</span>
          </div>
        </div>
      )}
      <PasswordField
        label="Nueva contraseña"
        name="nuevaPassword"
        value={newPassword}
        onChange={setNewPassword}
        show={showPassword}
        toggle={() => setShowPassword((value) => !value)}
      />
      <PasswordField
        label="Confirmar contraseña"
        name="confirmarPassword"
        value={confirmPassword}
        onChange={setConfirmPassword}
        show={showPassword}
        toggle={() => setShowPassword((value) => !value)}
      />
      <div className="ta-password-requirements" aria-live="polite">
        <strong>La contraseña debe incluir:</strong>
        <div>
          {checks.map((item) => (
            <span className={item.valid ? 'met' : newPassword ? 'missing' : ''} key={item.label}>
              <Check />
              {item.label}
            </span>
          ))}
        </div>
        <p className={passwordsMatch ? 'met' : confirmPassword ? 'missing' : ''}>
          <Check />
          {passwordsMatch
            ? 'Las contraseñas coinciden'
            : confirmPassword
              ? 'Las contraseñas no coinciden'
              : 'Confirma la nueva contraseña'}
        </p>
      </div>
      <button className="ta-login-submit" type="submit" disabled={loading || !valid}>
        <ShieldCheck />
        {loading ? 'Guardando…' : submitText}
      </button>
      {onBack && (
        <button className="ta-login-back" type="button" onClick={onBack}>
          Volver al inicio de sesión
        </button>
      )}
    </form>
  )
}

function PasswordField({ label, name, value, onChange, show, toggle }) {
  return (
    <label className="ta-field">
      <span className="ta-field-label">
        <b>
          {label} <i aria-hidden="true">*</i>
        </b>
      </span>
      <span className="ta-input-wrap">
        <LockKeyhole />
        <input
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Mínimo 8 caracteres"
          minLength="8"
          maxLength="100"
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          className="ta-password-toggle"
          onClick={toggle}
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </span>
    </label>
  )
}
