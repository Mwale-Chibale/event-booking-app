// AI-assisted: Dashboard page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface DashboardEvent {
  id:          number
  title:       string
  date:        string
  capacity:    number
  ticketsSold: number
  spotsLeft:   number
  createdAt:   string
}

export default function DashboardPage() {
  const router                              = useRouter()
  const { user, token, isLoading: authLoading } = useAuth()

  const [events,    setEvents]    = useState<DashboardEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  // Redirect if not logged in or not an organiser
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (user.role !== 'ORGANISER') {
      router.push('/')
    }
//     if (!authLoading && !user) {
//       router.push('/login')
//       return
//     }
//     if (!authLoading && user?.role !== 'ORGANISER') {
//       router.push('/')
//     }
}, [user, authLoading, router])

  useEffect(() => {
    if (!token) return

    const fetchEvents = async () => {
      try {
        const res  = await fetch('/api/dashboard/events', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load events')
          return
        }

        setEvents(data)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [token])

  const handleDelete = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) return

    setDeletingId(eventId)

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method:  'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to delete event')
        return
      }

      // Remove from local state instantly
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || isLoading) return <LoadingSpinner />

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your events</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800"
        >
          + New Event
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-lg mb-4">You haven&apos;t created any events yet.</p>
          <Link
            href="/dashboard/events/new"
            className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800"
          >
            Create your first event
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between gap-4">

                {/* Event info */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-500">
                    📅 {new Date(event.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day:     'numeric',
                      month:   'long',
                      year:    'numeric',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/dashboard/events/${event.id}/attendees`}
                    className="text-sm text-gray-600 hover:text-black underline"
                  >
                    Attendees
                  </Link>
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="text-sm text-gray-600 hover:text-black underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === event.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>

              </div>

              {/* Ticket stats */}
              <div className="mt-4 flex items-center gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Capacity</span>
                  <span className="font-semibold text-gray-900">{event.capacity}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Tickets Sold</span>
                  <span className="font-semibold text-green-600">{event.ticketsSold}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Spots Left</span>
                  <span className={`font-semibold ${event.spotsLeft === 0 ? 'text-red-500' : 'text-gray-900'}`}>
                    {event.spotsLeft}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  )
}