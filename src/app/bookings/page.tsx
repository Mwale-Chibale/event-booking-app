// AI-assisted: Bookings page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Booking {
  id:        number
  createdAt: string
  event: {
    id:          number
    title:       string
    description: string
    date:        string
    capacity:    number
    organiser:   { id: number; name: string }
  }
}

export default function BookingsPage() {
  const router                                  = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  const [bookings,     setBookings]     = useState<Booking[]>([])
  const [isLoading,    setIsLoading]    = useState(false)
  const [error,        setError]        = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    // Wait until AuthContext has finished reading localStorage
    if (authLoading) return

    // Not logged in — redirect
    if (!user || !token) {
      router.push('/login')
      return
    }

    // Logged in — fetch bookings
    const fetchBookings = async () => {
      setIsLoading(true)
      try {
        const res  = await fetch('/api/bookings', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load bookings')
          return
        }

        setBookings(data)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookings()
  }, [authLoading, user, token, router])

  const handleCancel = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    setCancellingId(bookingId)

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method:  'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to cancel booking')
        return
      }

      // Remove the cancelled booking from local state immediately
      setBookings((prev) => prev.filter((b) => b.id !== bookingId))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  // Wait for auth to resolve before rendering anything
  if (authLoading || isLoading) return <LoadingSpinner />

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold text-white-900 mb-2">My Bookings</h1>
      <p className="text-gray-500 mb-8">Events you have booked</p>

      {error && <ErrorMessage message={error} />}

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">You haven&apos;t booked any events yet.</p>
          <Link
            href="/"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border border-gray-200 rounded-lg p-6 flex items-start justify-between gap-4"
            >
              <div className="flex flex-col gap-1">

                <h2 className="text-lg font-semibold text-gray-900">
                  {booking.event.title}
                </h2>

                <p className="text-sm text-gray-500">
                  📅 {new Date(booking.event.date).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day:     'numeric',
                    month:   'long',
                    year:    'numeric',
                  })}
                </p>

                <p className="text-sm text-gray-500">
                  👤 Organised by {booking.event.organiser.name}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Booked on {new Date(booking.createdAt).toLocaleDateString('en-GB')}
                </p>

              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <Link
                  href={`/events/${booking.event.id}`}
                  className="text-sm text-gray-600 hover:text-black underline"
                >
                  View Event
                </Link>

                <button
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  )
}