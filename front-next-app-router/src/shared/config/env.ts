const apiUrl = process.env.API_URL

if (!apiUrl) {
  throw new Error('Falta API_URL. Copiá .env.example a .env.')
}

export const API_URL = apiUrl
