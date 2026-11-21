import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function TextInput({ label, error, ...props }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input aria-invalid={Boolean(error)} {...props} />
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  )
}
export function PasswordInput({ label, error, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      <span className="password-field-control">
        <input type={visible ? 'text' : 'password'} aria-invalid={Boolean(error)} {...props} />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </span>
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  )
}
export function SelectInput({ label, children, error, ...props }) {
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {props.disabled && props.name && (
        <input type="hidden" name={props.name} value={props.value ?? props.defaultValue ?? ''} />
      )}
      <select aria-invalid={Boolean(error)} {...props}>
        {children}
      </select>
      {error && (
        <small className="field-error" role="alert">
          {error}
        </small>
      )}
    </label>
  )
}
export function DateInput({ label, ...props }) {
  return <TextInput label={label} type="date" {...props} />
}
export function TimeInput({ label, ...props }) {
  return <TextInput label={label} type="time" min="07:00" max="22:00" {...props} />
}
export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`button ${variant}`} {...props}>
      {children}
    </button>
  )
}
export function AlertMessage({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message || type !== 'success' || !onClose) return
    const timer = window.setTimeout(onClose, 3000)
    return () => window.clearTimeout(timer)
  }, [message, type, onClose])
  return message ? (
    <div className={`alert ${type}`} role="status" aria-live="polite">
      <span>{message}</span>
      {onClose && (
        <button aria-label="Cerrar notificación" onClick={onClose}>
          ×
        </button>
      )}
    </div>
  ) : null
}
