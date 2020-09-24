import { FetchResult } from 'apollo-boost'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asErrorsToString<T>(evaluate: (e: any) => T) {
  return (p?: FetchResult) =>
    (p?.errors?.[0].extensions?.errors || [])
      .map((e: unknown) => evaluate(e))
      .filter(Boolean) as NonNullable<T>[]
}
