// AI-assisted: Events listing page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

// This mirrors the shape of an event returned by our API
interface Event {
  id:          number
  title:       string
  description: string
  date:        string
  capacity:    number
  spotsLeft:   number
  organiser:   { id: number; name: string }
}

export default function HomePage() {
  const [events,    setEvents]    = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState('')

  // Fetch events when the component first mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res  = await fetch('/api/events')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load events')
          return
        }

        setEvents(data.data)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, []) // empty array means this runs once on mount

  if (isLoading) return <LoadingSpinner />
  if (error)     return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <ErrorMessage message={error} />
    </main>
  )

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">

      <h1 className="text-3xl font-bold text-white-900 mb-2">Upcoming Events</h1>
      <p className="text-gray-500 mb-8">Browse and book events near you</p>

      {events.length === 0 ? (
        <p className="text-gray-500">No events available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-3 hover:shadow-md transition-shadow"
            >
              {/* Event title */}
              <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>

              {/* Date */}
              <p className="text-sm text-gray-500">
                {new Date(event.date).toLocaleDateString('en-GB', {
                  day:   'numeric',
                  month: 'long',
                  year:  'numeric',
                })}
              </p>

              {/* Description — clipped to 2 lines */}
              <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>

              {/* Organiser */}
              <p className="text-xs text-gray-400">By {event.organiser.name}</p>

              {/* Spots left */}
              <div className="mt-auto flex items-center justify-between">
                <span className={`text-sm font-medium ${event.spotsLeft === 0 ? 'text-red-500' : 'text-green-600'}`}>
                  {event.spotsLeft === 0 ? 'Fully booked' : `${event.spotsLeft} spots left`}
                </span>

                <Link
                  href={`/events/${event.id}`}
                  className="text-sm bg-black text-white px-4 py-1.5 rounded-md hover:bg-gray-800"
                >
                  View
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </main>
  )
}