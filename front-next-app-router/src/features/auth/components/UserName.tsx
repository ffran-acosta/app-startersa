import { api } from '@/shared/api/client'

export async function UserName() {
  const { data } = await api.GET('/auth/me')
  return data && <span className="text-slate-600">{data.name}</span>
}
