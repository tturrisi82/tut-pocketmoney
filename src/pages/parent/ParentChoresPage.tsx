import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useChores, useCreateChore, useUpdateChore, useDeleteChore, type ChoreInput } from '../../hooks/useManageChores'
import { ChoreForm } from '../../components/chores/ChoreForm'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import type { Chore } from '../../types/app.types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type ChoreFormValues = ChoreInput

export function ParentChoresPage({ userId }: { userId: string }) {
  const { data: chores, isLoading } = useChores()
  const createChore = useCreateChore(userId)
  const updateChore = useUpdateChore()
  const deleteChore = useDeleteChore()

  const [modal, setModal] = useState<'create' | Chore | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleCreate(values: ChoreFormValues) {
    await createChore.mutateAsync(values)
    setModal(null)
  }

  async function handleUpdate(values: ChoreFormValues) {
    if (!modal || modal === 'create') return
    await updateChore.mutateAsync({ id: modal.id, ...values })
    setModal(null)
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try { await deleteChore.mutateAsync(id) } finally { setDeletingId(null) }
  }

  const daily = chores?.filter((c) => c.frequency === 'daily') ?? []
  const weekly = chores?.filter((c) => c.frequency === 'weekly') ?? []

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage Luca's chore list</p>
        </div>
        <Button onClick={() => setModal('create')}>
          <Plus size={16} />
          Add chore
        </Button>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && chores?.length === 0 && (
        <EmptyState
          title="No chores yet"
          description="Add your first chore to get started."
          action={<Button onClick={() => setModal('create')}><Plus size={14} /> Add chore</Button>}
        />
      )}

      {/* Daily chores */}
      {daily.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Daily</h2>
          {daily.map((chore) => (
            <ChoreListItem
              key={chore.id}
              chore={chore}
              onEdit={() => setModal(chore)}
              onDelete={() => handleDelete(chore.id)}
              deleting={deletingId === chore.id}
            />
          ))}
        </section>
      )}

      {/* Weekly chores */}
      {weekly.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Weekly</h2>
          {weekly.map((chore) => (
            <ChoreListItem
              key={chore.id}
              chore={chore}
              onEdit={() => setModal(chore)}
              onDelete={() => handleDelete(chore.id)}
              deleting={deletingId === chore.id}
              dayName={chore.day_of_week != null ? DAY_NAMES[chore.day_of_week] : undefined}
            />
          ))}
        </section>
      )}

      {/* Create modal */}
      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Add chore">
        <ChoreForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
      </Modal>

      {/* Edit modal */}
      {modal && modal !== 'create' && (
        <Modal open onClose={() => setModal(null)} title="Edit chore">
          <ChoreForm
            defaultValues={modal}
            onSubmit={handleUpdate}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}

function ChoreListItem({
  chore,
  onEdit,
  onDelete,
  deleting,
  dayName,
}: {
  chore: Chore
  onEdit: () => void
  onDelete: () => void
  deleting: boolean
  dayName?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{chore.title}</p>
        {chore.description && <p className="text-xs text-gray-400 truncate">{chore.description}</p>}
      </div>
      {dayName && <Badge variant="blue">{dayName}</Badge>}
      <div className="flex gap-1">
        <button
          onClick={onEdit}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Edit"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          aria-label="Delete"
        >
          {deleting ? (
            <span className="h-3.5 w-3.5 block animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Trash2 size={15} />
          )}
        </button>
      </div>
    </div>
  )
}
