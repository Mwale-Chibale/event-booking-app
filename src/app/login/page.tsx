// AI-assisted: Login page structure aided by Claude (Anthropic)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import ErrorMessage from '@/components/ErrorMessage'

export default function LoginPage () {
  const router   = useRouter()
  const { login } = useAuth()

  // Form field state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // UI state
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser's default form submission behaviour
    e.preventDefault()
    setError('')

    // Basic client-side validation before hitting the API
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Use the error message from our API if available
        setError(data.error || 'Login failed')
        return
      }

      // Save token and user to context + localStorage
      login(data.token, {
        userId: data.userId,
        name:   data.name,
        role:   data.role,
      })

      // Redirect based on role
      if (data.role === 'ORGANISER') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      // Always runs — hides the loading state whether it succeeded or failed
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 w-full max-w-md">

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Login</h1>

        {/* Show error if there is one */}
        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-purple-600 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-black font-medium hover:underline">
            Register
          </Link>
        </p>

      </div>
    </main>
  )
}