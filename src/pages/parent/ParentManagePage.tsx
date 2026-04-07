import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Tag } from 'lucide-react'
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useReorderCategories } from '../../hooks/useCategories'
import { useAllChores, useCreateChore, useUpdateChore, useDeleteChore, useReorderChores, type ChoreInput } from '../../hooks/useManageChores'
import { ChoreForm } from '../../components/chores/ChoreForm'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import type { Chore, Category } from '../../types/app.types'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function ParentManagePage({ userId }: { userId: string }) {
  const { data: categories = [], isLoading: catsLoading } = useCategories()
  const { data: chores = [], isLoading: choresLoading } = useAllChores()

  const createCategory = useCreateCategory(userId)
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const reorderCategories = useReorderCategories()

  const createChore = useCreateChore(userId)
  const updateChore = useUpdateChore()
  const deleteChore = useDeleteChore()
  const reorderChores = useReorderChores()

  const [choreModal, setChoreModal] = useState<'create' | Chore | null>(null)
  const [catModal, setCatModal] = useState<'create' | Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catError, setCatError] = useState('')
  const [activeTab, setActiveTab] = useState<'chores' | 'categories'>('chores')

  // --- Category actions ---
  async function handleSaveCategory() {
    if (!catName.trim()) { setCatError('Name is required'); return }
    if (catModal === 'create') {
      await createCategory.mutateAsync({ name: catName.trim(), sort_order: categories.length })
    } else if (catModal) {
      await updateCategory.mutateAsync({ id: catModal.id, name: catName.trim() })
    }
    setCatModal(null); setCatName(''); setCatError('')
  }

  function openEditCat(cat: Category) { setCatModal(cat); setCatName(cat.name); setCatError('') }
  function openCreateCat() { setCatModal('create'); setCatName(''); setCatError('') }

  async function moveCat(index: number, dir: -1 | 1) {
    const reordered = [...categories]
    const swap = reordered[index + dir]
    reordered[index + dir] = reordered[index]
    reordered[index] = swap
    await reorderCategories.mutateAsync(reordered)
  }

  // --- Chore actions ---
  async function handleCreateChore(values: ChoreInput) {
    const catChores = chores.filter(c => c.category_id === (values.category_id ?? null) && c.is_active)
    await createChore.mutateAsync({ ...values, sort_order: catChores.length })
    setChoreModal(null)
  }

  async function handleUpdateChore(values: ChoreInput) {
    if (!choreModal || choreModal === 'create') return
    await updateChore.mutateAsync({ id: choreModal.id, ...values })
    setChoreModal(null)
  }

  async function toggleChore(chore: Chore) {
    await updateChore.mutateAsync({ id: chore.id, title: chore.title, frequency: chore.frequency, is_active: !chore.is_active })
  }

  async function moveChore(chore: Chore, dir: -1 | 1) {
    const siblings = chores
      .filter(c => c.category_id === chore.category_id && c.is_active)
      .sort((a, b) => a.sort_order - b.sort_order)
    const idx = siblings.findIndex(c => c.id === chore.id)
    if (idx + dir < 0 || idx + dir >= siblings.length) return
    const reordered = [...siblings]
    const swap = reordered[idx + dir]
    reordered[idx + dir] = reordered[idx]
    reordered[idx] = swap
    await reorderChores.mutateAsync(reordered.map((c, i) => ({ id: c.id, sort_order: i })))
  }

  // Group active chores by category
  const activeChores = chores.filter(c => c.is_active).sort((a, b) => a.sort_order - b.sort_order)
  const inactiveChores = chores.filter(c => !c.is_active)

  const categorised = categories.map(cat => ({
    cat,
    chores: activeChores.filter(c => c.category_id === cat.id),
  }))
  const uncategorised = activeChores.filter(c => !c.category_id)

  const isLoading = catsLoading || choresLoading

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Manage Chores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up Luca's chore list and categories</p>
        </div>
        <Button onClick={() => setChoreModal('create')}>
          <Plus size={15} /> Add chore
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {(['chores', 'categories'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors capitalize ${
              activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSpinner />}

      {/* ---- CHORES TAB ---- */}
      {!isLoading && activeTab === 'chores' && (
        <div className="space-y-5">
          {chores.length === 0 && (
            <EmptyState
              title="No chores yet"
              description="Add your first chore to get started."
              action={<Button onClick={() => setChoreModal('create')}><Plus size={14} /> Add chore</Button>}
            />
          )}

          {/* Categorised groups */}
          {categorised.map(({ cat, chores: catChores }) => (
            <CategorySection
              key={cat.id}
              title={cat.name}
              chores={catChores}
              onEdit={(c) => setChoreModal(c)}
              onToggle={toggleChore}
              onDelete={(id) => deleteChore.mutateAsync(id)}
              onMove={moveChore}
            />
          ))}

          {/* Uncategorised */}
          {uncategorised.length > 0 && (
            <CategorySection
              title="Uncategorised"
              chores={uncategorised}
              onEdit={(c) => setChoreModal(c)}
              onToggle={toggleChore}
              onDelete={(id) => deleteChore.mutateAsync(id)}
              onMove={moveChore}
            />
          )}

          {/* Disabled chores */}
          {inactiveChores.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Disabled</h2>
              {inactiveChores.map(chore => (
                <ChoreRow
                  key={chore.id}
                  chore={chore}
                  disabled
                  onEdit={() => setChoreModal(chore)}
                  onToggle={() => toggleChore(chore)}
                  isFirst isLast
                />
              ))}
            </section>
          )}
        </div>
      )}

      {/* ---- CATEGORIES TAB ---- */}
      {!isLoading && activeTab === 'categories' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" onClick={openCreateCat}>
              <Plus size={14} /> New category
            </Button>
          </div>

          {categories.length === 0 && (
            <EmptyState
              icon={<Tag size={28} />}
              title="No categories yet"
              description="Create categories like Morning Routine, Bedtime, etc."
              action={<Button size="sm" onClick={openCreateCat}><Plus size={14} /> New category</Button>}
            />
          )}

          {categories.map((cat, idx) => {
            const choreCount = chores.filter(c => c.category_id === cat.id && c.is_active).length
            return (
              <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveCat(idx, -1)}
                    disabled={idx === 0}
                    className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20"
                  ><ChevronUp size={14} /></button>
                  <button
                    onClick={() => moveCat(idx, 1)}
                    disabled={idx === categories.length - 1}
                    className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20"
                  ><ChevronDown size={14} /></button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                  <p className="text-xs text-gray-400">{choreCount} chore{choreCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditCat(cat)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => deleteCategory.mutateAsync(cat.id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/edit chore modal */}
      <Modal
        open={!!choreModal}
        onClose={() => setChoreModal(null)}
        title={choreModal === 'create' ? 'Add chore' : 'Edit chore'}
      >
        <ChoreForm
          defaultValues={choreModal !== 'create' && choreModal ? choreModal : undefined}
          categories={categories}
          onSubmit={choreModal === 'create' ? handleCreateChore : handleUpdateChore}
          onCancel={() => setChoreModal(null)}
        />
      </Modal>

      {/* Create/edit category modal */}
      <Modal
        open={!!catModal}
        onClose={() => { setCatModal(null); setCatName(''); setCatError('') }}
        title={catModal === 'create' ? 'New category' : 'Rename category'}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Category name</span>
            <input
              value={catName}
              onChange={e => { setCatName(e.target.value); setCatError('') }}
              placeholder="e.g. Morning Routine"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleSaveCategory() }}
            />
            {catError && <p className="mt-1 text-xs text-red-500">{catError}</p>}
          </label>
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" size="sm" onClick={() => { setCatModal(null); setCatName('') }}>Cancel</Button>
            <Button size="sm" loading={createCategory.isPending || updateCategory.isPending} onClick={handleSaveCategory}>
              {catModal === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function CategorySection({
  title, chores, onEdit, onToggle, onDelete, onMove
}: {
  title: string
  chores: Chore[]
  onEdit: (c: Chore) => void
  onToggle: (c: Chore) => void
  onDelete: (id: string) => void
  onMove: (c: Chore, dir: -1 | 1) => void
}) {
  if (chores.length === 0 && title === 'Uncategorised') return null
  return (
    <section className="space-y-2">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {chores.length === 0 ? (
        <p className="text-sm text-gray-400 italic px-1">No chores in this category yet</p>
      ) : (
        chores.map((chore, idx) => (
          <ChoreRow
            key={chore.id}
            chore={chore}
            onEdit={() => onEdit(chore)}
            onToggle={() => onToggle(chore)}
            onDelete={() => onDelete(chore.id)}
            onMoveUp={idx > 0 ? () => onMove(chore, -1) : undefined}
            onMoveDown={idx < chores.length - 1 ? () => onMove(chore, 1) : undefined}
            isFirst={idx === 0}
            isLast={idx === chores.length - 1}
          />
        ))
      )}
    </section>
  )
}

function ChoreRow({
  chore, onEdit, onToggle, onDelete, onMoveUp, onMoveDown, disabled, isFirst, isLast
}: {
  chore: Chore
  onEdit: () => void
  onToggle: () => void
  onDelete?: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  disabled?: boolean
  isFirst?: boolean
  isLast?: boolean
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${disabled ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200 bg-white'}`}>
      {/* Reorder arrows */}
      {!disabled && (
        <div className="flex flex-col gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20">
            <ChevronDown size={13} />
          </button>
        </div>
      )}

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${disabled ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {chore.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="blue">{chore.frequency === 'weekly' && chore.day_of_week != null ? DAY_NAMES[chore.day_of_week] : 'Daily'}</Badge>
          {chore.description && <span className="text-xs text-gray-400 truncate">{chore.description}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title="Edit">
          <Pencil size={14} />
        </button>
        <button onClick={onToggle} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" title={disabled ? 'Enable' : 'Disable'}>
          {disabled ? <ToggleLeft size={16} /> : <ToggleRight size={16} className="text-indigo-500" />}
        </button>
        {onDelete && (
          <button onClick={onDelete} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Delete">
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
