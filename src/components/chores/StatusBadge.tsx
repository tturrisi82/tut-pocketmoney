import { Badge } from '../ui/Badge'
import type { ChoreStatus } from '../../types/app.types'

const statusConfig: Record<ChoreStatus, { label: string; variant: 'gray' | 'yellow' | 'green' | 'red' }> = {
  pending: { label: 'Pending', variant: 'gray' },
  pending_approval: { label: 'Awaiting approval', variant: 'yellow' },
  approved: { label: 'Approved', variant: 'green' },
  rejected: { label: 'Rejected', variant: 'red' },
}

export function StatusBadge({ status }: { status: ChoreStatus }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
