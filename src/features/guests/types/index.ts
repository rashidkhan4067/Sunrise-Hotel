export interface Guest {
  id: number | string
  full_name: string
  phone_number: string
  email?: string | null
  document_number: string
  address?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}
