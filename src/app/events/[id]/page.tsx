// AI-assisted: Event detail page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

interface Event {
  id:          number
  title:       string
  description: string
  date:        string
  capacity:    number
  spotsLeft:   number
  organiser:   { id: number; name: string }
}

export default function EventDetailPage() {
  const params            = useParams()
  const id                = Array.isArray(params.id) ? params.id[0] : params.id
  const router            = useRouter()
  const { user, token }   = useAuth()

  const [event,      setEvent]      = useState<Event | null>(null)
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState('')
  const [isBooking,  setIsBooking]  = useState(false)
  const [bookingMsg, setBookingMsg] = useState('')

  useEffect(() => {
    if (!id) return

    const fetchEvent = async () => {
      try {
        const res  = await fetch(`/api/events/${id}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Failed to load event')
          return
        }

        setEvent(data)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleBook = async () => {
    if (!user || !token) {
      router.push('/login')
      return
    }

    setIsBooking(true)
    setBookingMsg('')
    setError('')

    try {
      const res  = await fetch(`/api/events/${id}/bookings`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Booking failed')
        return
      }

      setBookingMsg('🎉 Booking confirmed!')
      setEvent((prev) => prev ? { ...prev, spotsLeft: prev.spotsLeft - 1 } : prev)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  if (error && !event) return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <ErrorMessage message={error} />
    </main>
  )

  if (!event) return null

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      <button
        onClick={() => router.back()}
        className="text-sm text-white-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-8 flex flex-col gap-4">

        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>

        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <span>
            📅 {new Date(event.date).toLocaleDateString('en-GB', {
              weekday: 'long',
              day:     'numeric',
              month:   'long',
              year:    'numeric',
            })}
          </span>
          <span>👤 Organised by {event.organiser.name}</span>
        </div>

        <p className="text-gray-700 leading-relaxed">{event.description}</p>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Capacity: {event.capacity}</span>
          <span className="text-gray-300">|</span>
          <span className={event.spotsLeft === 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'}>
            {event.spotsLeft === 0 ? 'Fully booked' : `${event.spotsLeft} spots left`}
          </span>
        </div>

        {bookingMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {bookingMsg}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {user?.role === 'ATTENDEE' && event.spotsLeft > 0 && !bookingMsg && (
          <button
            onClick={handleBook}
            disabled={isBooking}
            className="bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBooking ? 'Booking...' : 'Book Ticket'}
          </button>
        )}

        {!user && event.spotsLeft > 0 && (
          <button
            onClick={() => router.push('/login')}
            className="bg-black text-white py-3 rounded-md hover:bg-gray-800"
          >
            Login to Book
          </button>
        )}

      </div>
    </main>
  )
}