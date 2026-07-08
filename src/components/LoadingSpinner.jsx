export default function LoadingSpinner({ message = 'Chargement...' }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        <p className="mt-3 text-sm text-gray-500">{message}</p>
      </div>
    </div>
  )
}
