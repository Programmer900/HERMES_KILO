interface StatCardProps {
  value: string | number
  label: string
  color: string
}

export default function StatCard({ value, label, color }: StatCardProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm">
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-gray-400 text-sm">{label}</div>
    </div>
  )
}
