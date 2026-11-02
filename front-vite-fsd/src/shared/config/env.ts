const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error('Falta VITE_API_URL. Copiá .env.example a .env.')
}

export const API_URL = apiUrl
