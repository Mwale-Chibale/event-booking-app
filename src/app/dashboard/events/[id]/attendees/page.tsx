// AI-assisted: Attendees page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Attendee {
  bookingId: number
  bookedAt:  string
  user: {
    id:    number
    name:  string
    email: string
  }
}

interface EventInfo {
  id:    number
  title: string
}

export default function AttendeesPage() {
  const params        = useParams()
  const id            = Array.isArray(params.id) ? params.id[0] : params.id
  const router        = useRouter()
  const { token, user, isLoading: authLoading } = useAuth()

  const [event,      setEvent]      = useState<EventInfo | null>(null)
  const [attendees,  setAttendees]  = useState<Attendee[]>([])
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState('')

  // Redirect if not organiser
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (user.role !== 'ORGANISER') {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!id || !token) return

    const fetchAttendees = async () => {
      try {
        const res  = await fetch(`/api/dashboard/events/${id}/attendees`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load attendees')
          return
        }

        setEvent(data.event)
        setAttendees(data.attendees)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendees()
  }, [id, token])

  if (authLoading || isLoading) return <LoadingSpinner />

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">

      <button
        onClick={() => router.back()}
        className="text-sm text-white-500 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white-900">Attendees</h1>
        {event && (
          <p className="text-white-700 mt-1">{event.title}</p>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {attendees.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg">No attendees yet.</p>
          <p className="text-sm mt-2">Share your event to get bookings.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">

          {/* Summary */}
          <p className="text-sm text-gray-500 mb-2">
            {attendees.length} attendee{attendees.length !== 1 ? 's' : ''} registered
          </p>

          {/* Attendee list */}
          {attendees.map((attendee, index) => (
            <div
              key={attendee.bookingId}
              className="bg-white border border-gray-200 rounded-lg px-6 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">

                {/* Row number */}
                <span className="text-sm text-gray-400 w-6">{index + 1}</span>

                <div>
                  <p className="font-medium text-gray-900">{attendee.user.name}</p>
                  <p className="text-sm text-gray-500">{attendee.user.email}</p>
                </div>

              </div>

              <p className="text-xs text-gray-400">
                Booked {new Date(attendee.bookedAt).toLocaleDateString('en-GB', {
                  day:   'numeric',
                  month: 'short',
                  year:  'numeric',
                })}
              </p>

            </div>
          ))}

        </div>
      )}

    </main>
  )
}