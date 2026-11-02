import { createBrowserRouter, Navigate } from 'react-router'
import { LoginPage } from '@/pages/login'
import { RegisterPage } from '@/pages/register'
import { TodoFormPage } from '@/pages/todo-form'
import { TodosPage } from '@/pages/todos'
import { RequireAuth, RequireGuest } from './guards'
import { AppLayout } from './layouts/AppLayout'

export const router = createBrowserRouter([
  {
    element: <RequireGuest />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/todos', element: <TodosPage /> },
          { path: '/todos/new', element: <TodoFormPage /> },
          { path: '/todos/:id/edit', element: <TodoFormPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/todos" replace /> },
])
