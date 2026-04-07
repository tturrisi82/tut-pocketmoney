import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../ui/Button'
import type { Chore, Category } from '../../types/app.types'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(300).optional(),
  frequency: z.enum(['daily', 'weekly']),
  day_of_week: z.number().min(0).max(6).nullable().optional(),
  category_id: z.string().nullable().optional(),
}).refine(
  (data) => data.frequency === 'daily' || data.day_of_week != null,
  { message: 'Day of week is required for weekly chores', path: ['day_of_week'] }
)

type FormValues = z.infer<typeof schema>

interface ChoreFormProps {
  defaultValues?: Partial<Chore>
  categories?: Category[]
  onSubmit: (values: FormValues) => Promise<void>
  onCancel: () => void
}

export function ChoreForm({ defaultValues, categories = [], onSubmit, onCancel }: ChoreFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      frequency: defaultValues?.frequency ?? 'daily',
      day_of_week: defaultValues?.day_of_week ?? null,
      category_id: defaultValues?.category_id ?? null,
    },
  })

  const frequency = watch('frequency')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Title */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Chore name *</span>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g. Make your bed"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
      </label>

      {/* Description */}
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Description (optional)</span>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="Any extra details for Luca"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </label>

      {/* Category */}
      {categories.length > 0 && (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Category</span>
          <select
            {...register('category_id')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Uncategorised</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>
      )}

      {/* Frequency */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700">Frequency *</legend>
        <div className="mt-2 flex gap-3">
          {(['daily', 'weekly'] as const).map((freq) => (
            <label key={freq} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={freq}
                {...register('frequency')}
                onChange={() => {
                  setValue('frequency', freq)
                  if (freq === 'daily') setValue('day_of_week', null)
                }}
                className="text-indigo-600"
              />
              <span className="text-sm capitalize">{freq}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Day of week (weekly only) */}
      {frequency === 'weekly' && (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Day of week *</span>
          <select
            {...register('day_of_week', { valueAsNumber: true })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a day…</option>
            {DAY_NAMES.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          {errors.day_of_week && <p className="mt-1 text-xs text-red-500">{errors.day_of_week.message}</p>}
        </label>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {defaultValues?.id ? 'Save changes' : 'Add chore'}
        </Button>
      </div>
    </form>
  )
}
