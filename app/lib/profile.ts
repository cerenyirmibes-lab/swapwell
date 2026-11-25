type ProfileLike = {
  full_name?: string | null
  username?: string | null
  avatar_url?: string | null
  phone?: string | null
} | null

export const isProfileComplete = (p: ProfileLike) =>
  !!(
    p &&
    p.full_name?.trim() &&
    p.username?.trim() &&
    p.avatar_url &&
    p.phone?.trim()
  )