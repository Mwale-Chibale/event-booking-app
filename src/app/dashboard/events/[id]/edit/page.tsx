// AI-assisted: Edit event page aided by Claude (Anthropic)
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

export default function EditEventPage() {
  const params        = useParams()
  const id            = Array.isArray(params.id) ? params.id[0] : params.id
  const router        = useRouter()
  const { token }     = useAuth()

  // Form fields
  const [title,       setTitle]       = useState('')
  const [description, setDescription] = useState('')
  const [date,        setDate]        = useState('')
  const [capacity,    setCapacity]    = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving,  setIsSaving]  = useState(false)
  const [error,     setError]     = useState('')

  // Fetch existing event data to pre-fill the form
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

        // Pre-fill form with existing values
        setTitle(data.title)
        setDescription(data.description)
        setCapacity(String(data.capacity))

        // Convert ISO date string to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatted = new Date(data.date).toISOString().slice(0, 16)
        setDate(formatted)
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title || !description || !date || !capacity) {
      setError('Please fill in all fields')
      return
    }

    if (parseInt(capacity) < 1) {
      setError('Capacity must be at least 1')
      return
    }

    setIsSaving(true)

    try {
      const res  = await fetch(`/api/events/${id}`, {
        method:  'PUT',
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
        setError(data.error || 'Failed to update event')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      <button
        onClick={() => router.back()}
        className="text-sm text-white-500 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-white-900 mb-8">Edit Event</h1>

      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min={1}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-gray-600 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

      </form>

    </main>
  )
}