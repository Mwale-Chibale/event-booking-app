// AI-assisted: Error component aided by Claude (Anthropic)
interface Props {
  message: string
}

export default function ErrorMessage({ message }: Props) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
      {message}
    </div>
  )
}