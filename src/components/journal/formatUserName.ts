import i18n from '@/i18n'
import type { User } from '@/services/user'

const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

export function formatUserName(user?: User): string {
  if (!user) return ''
  const last = user.traits?.name?.last ?? ''
  const first = user.traits?.name?.first ?? ''
  const fullName = last + first
  if (fullName) return fullName
  if (user.id === SYSTEM_USER_ID) return i18n.global.t('user.system')
  // Final fallback: use email prefix
  return user.traits?.email ?? ''
}
