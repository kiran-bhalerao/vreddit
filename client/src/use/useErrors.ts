import { asErrorsToString } from '@/utils/asErrorsToString'
import { capitalize } from '@/utils/capitalize'
import { ref } from '@vue/composition-api'
import { FetchResult } from 'apollo-boost'

type FieldError = {
  field: string
  error: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type O = Record<string, any>

type DoneFn<T> = (
  fn: (p?: FetchResult<T, O, O>) => void
) => {
  off: () => void
}

export function useErrors<T>(onDone: DoneFn<T>) {
  const errors = ref<FieldError[]>([])
  const error = ref('')
  const success = ref(false)

  onDone(p => {
    const r = asErrorsToString(e => {
      if (e.constraints) {
        return {
          field: e.property,
          error: Object.values(e.constraints)[0]
        } as FieldError
      }
    })(p)

    errors.value = r
    error.value = r.length < 1 ? p?.errors?.[0].message || '' : ''
    success.value = p?.data !== null
  })

  function getErrorText(field: string) {
    for (const err of errors.value) {
      if (err.field === field) {
        return capitalize(err.error)
      }
    }
  }

  return { errors, error, success, getErrorText }
}
