import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSettings, useUpdateSettings } from '../../hooks/useSettings'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

const schema = z.object({
  weekly_target: z
    .number({ error: 'Enter a number' })
    .min(0.01, 'Must be greater than 0')
    .max(1000, 'Maximum is £1,000'),
})

type FormValues = z.infer<typeof schema>

export function ParentSettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSettings = useUpdateSettings()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { weekly_target: 10 },
  })

  // Populate form once settings load
  useEffect(() => {
    if (settings) reset({ weekly_target: settings.weekly_target })
  }, [settings, reset])

  async function onSubmit(values: FormValues) {
    await updateSettings.mutateAsync({ weekly_target: values.weekly_target })
    reset(values) // clear dirty state
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure pocket money rules</p>
      </div>

      {isLoading && <LoadingSpinner />}

      {!isLoading && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Pocket Money</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Weekly target (£)</span>
              <p className="text-xs text-gray-400 mb-1.5">
                Luca earns this amount if all chores are approved for the week.
              </p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">£</span>
                <input
                  {...register('weekly_target', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              {errors.weekly_target && (
                <p className="mt-1 text-xs text-red-500">{errors.weekly_target.message}</p>
              )}
            </label>

            {updateSettings.isSuccess && !isDirty && (
              <p className="text-sm text-emerald-600 font-medium">Saved!</p>
            )}

            <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
              Save changes
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
