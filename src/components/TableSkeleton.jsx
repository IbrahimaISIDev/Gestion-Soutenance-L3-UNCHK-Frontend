export default function TableSkeleton({ cols = 5, rows = 6 }) {
  return (
    <tbody className="divide-y divide-gray-50">
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-5 py-4">
              <div
                className="h-3.5 animate-pulse rounded-md bg-gray-100"
                style={{ width: c === 0 ? '2rem' : c === cols - 1 ? '5rem' : `${55 + Math.random() * 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
