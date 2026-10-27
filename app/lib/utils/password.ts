/** New-account password rules, used by the sign-up schema and the live checklist. */
export const PASSWORD_MIN_LENGTH = 10
export const PASSWORD_MAX_LENGTH = 128

export const PASSWORD_RULES = [
  {
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    pattern: new RegExp(`^.{${PASSWORD_MIN_LENGTH},}$`)
  },
  { label: 'One uppercase letter', pattern: /[A-Z]/ },
  { label: 'One lowercase letter', pattern: /[a-z]/ },
  { label: 'One number', pattern: /\d/ },
  { label: 'One symbol, like ! or #', pattern: /[^A-Za-z0-9]/ }
] as const

// String.raw keeps \d intact; a plain template literal would turn it into "d".
export const PASSWORD_PATTERN = new RegExp(
  String.raw`^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{${PASSWORD_MIN_LENGTH},${PASSWORD_MAX_LENGTH}}$`
)
