import { cn } from '@/lib/utils'
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './form'
import { Switch } from './switch'

interface SwitchWidgetProps {
  label: string
  description?: string
  className?: string
  field?: {
    value: boolean
    onChange: () => void
  }
  isSwitchable?: boolean
}

const SwitchWidget: React.FC<SwitchWidgetProps> = ({
  label,
  description,
  field,
  className,
  isSwitchable = true
}) => {
  return (
    <FormItem
      className={cn(
        'md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-4',
        className
      )}
    >
      <div className="space-y-0.5">
        <FormLabel className="text-base">{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      {isSwitchable && (
        <FormControl>
          <Switch checked={field?.value} onCheckedChange={field?.onChange} />
        </FormControl>
      )}
      <FormMessage />
    </FormItem>
  )
}

export default SwitchWidget
