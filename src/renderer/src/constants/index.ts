import { LucideIcon } from 'lucide-react'

export type facetedFilter = {
  accessorKey: string
  label: string
  options: {
    value: string
    label: string
    icon: LucideIcon
  }[]
}
