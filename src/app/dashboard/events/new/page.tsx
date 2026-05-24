// AI-assisted: Create event page aided by Claude (Anthropic)
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ErrorMessage from '@/components/ErrorMessage'

export default function NewEventPage() {
  const router        = useRouter()
  const { token }     = useAuth()

  // Form fields
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState('')
  const [capacity,    setCapacity]    = useState('')

  // UI state
  const [error,     setError]     = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!title || !description || !date || !capacity) {
      setError('Please fill in all fields')
      return
    }

    if (parseInt(capacity) < 1) {
      setError('Capacity must be at least 1')
      return
    }

    setIsLoading(true)

    try {
      const res  = await fetch('/api/events', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          date,
          capacity: parseInt(capacity),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create event')
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      <button
        onClick={() => router.back()}
        className="text-sm text-gray-500 hover:text-gray-900 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Event</h1>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
            placeholder="Describe your event"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min={1}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Max number of attendees"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Event'}
        </button>

      </form>

    </main>
  )
}