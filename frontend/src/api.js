const API = import.meta.env.VITE_API_URL || 'http://localhost:5264/api'
export const getSession = () =>
  JSON.parse(
    localStorage.getItem('techasset-session') ||
      sessionStorage.getItem('techasset-session') ||
      'null',
  )
export const saveSession = (value, remember = true) => {
  localStorage.removeItem('techasset-session')
  sessionStorage.removeItem('techasset-session')
  if (value)
    (remember ? localStorage : sessionStorage).setItem('techasset-session', JSON.stringify(value))
}
export async function request(path, options = {}) {
  const session = getSession()
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...options.headers,
    },
  })
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  const validationMessage = data?.errors ? Object.values(data.errors).flat().find(Boolean) : null
  if (!response.ok)
    throw new Error(
      data?.mensaje ||
        validationMessage ||
        (response.status === 401
          ? 'La sesión no es válida.'
          : 'No se pudo completar la operación.'),
    )
  return data
}
