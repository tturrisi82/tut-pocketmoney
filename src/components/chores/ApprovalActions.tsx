import { useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ApprovalActionsProps {
  instanceId: string
  choreTitle: string
  onApprove: (instanceId: string) => Promise<void>
  onReject: (instanceId: string, note: string) => Promise<void>
}

export function ApprovalActions({ instanceId, choreTitle, onApprove, onReject }: ApprovalActionsProps) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [note, setNote] = useState('')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  async function handleApprove() {
    setApproving(true)
    try { await onApprove(instanceId) } finally { setApproving(false) }
  }

  async function handleReject() {
    setRejecting(true)
    try {
      await onReject(instanceId, note)
      setRejectOpen(false)
      setNote('')
    } finally { setRejecting(false) }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="success"
          size="sm"
          loading={approving}
          onClick={handleApprove}
        >
          <CheckCircle2 size={15} />
          Approve
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setRejectOpen(true)}
        >
          <XCircle size={15} />
          Reject
        </Button>
      </div>

      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title={`Reject "${choreTitle}"?`}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Leave a note for Luca (optional)</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. You need to redo the dishes — they weren't clean"
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={rejecting} onClick={handleReject}>
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
