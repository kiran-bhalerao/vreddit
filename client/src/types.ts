/** ** Enums ****/

export enum CToastStatus {
  'success' = 'success',
  'error' = 'error',
  'warning' = 'warning',
  'info' = 'info'
}

/** ** Types ****/

export type ToastType = {
  title: string
  description: string
  status: CToastStatus
  duration?: number
  position?: string
  isClosable?: boolean
}
