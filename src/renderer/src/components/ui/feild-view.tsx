import { cn } from '@/lib/utils'

interface FeildViewProps {
  label: string
  value: string
  className?: string
}

export const FeildView = ({ label, value, className }: FeildViewProps) => {
  return (
    <div className={cn('bg-gray-100 dark:bg-secondary/85 px-3 py-2 border rounded-md', className)}>
      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  )
}
