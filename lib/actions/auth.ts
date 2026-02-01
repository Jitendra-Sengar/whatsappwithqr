'use server'

import { redirect } from 'next/navigation'
import {
  registerTenant,
  loginUser,
  createSession,
  setSessionCookie,
  clearSession,
} from '@/lib/auth'

export async function registerAction(formData: FormData) {
  const tenantName = formData.get('tenantName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const userName = formData.get('name') as string

  if (!tenantName || !email || !password || !userName) {
    return { error: 'All fields are required' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    const { tenant, user } = await registerTenant(tenantName, email, password, userName)
    const token = await createSession(user.id, tenant.id)
    await setSessionCookie(token)
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Registration failed' }
  }

  redirect('/dashboard')
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    const { user, tenant } = await loginUser(email, password)
    const token = await createSession(user.id, tenant.id)
    await setSessionCookie(token)
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: 'Login failed' }
  }

  redirect('/dashboard')
}

export async function logoutAction() {
  await clearSession()
  redirect('/login')
}
