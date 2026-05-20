// AI-assisted: Navbar structure aided by Claude (Anthropic)
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">

        {/* Left side — app name */}
        <Link href="/" className="text-xl font-bold text-gray-900">
          EventApp
        </Link>

        {/* Right side — links based on auth state */}
        <div className="flex items-center gap-6">

          {/* Always visible */}
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Events
          </Link>

          {/* Not logged in */}
          {!user && (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}

          {/* Attendee only */}
          {user?.role === 'ATTENDEE' && (
            <Link href="/bookings" className="text-gray-600 hover:text-gray-900">
              My Bookings
            </Link>
          )}

          {/* Organiser only */}
          {user?.role === 'ORGANISER' && (
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
          )}

          {/* Logged in — show username and logout */}
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Hi, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}