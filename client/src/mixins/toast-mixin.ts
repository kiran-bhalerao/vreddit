import { ToastType } from '@/types'

export const ToastMixin = {
  methods: {
    showToast(this: Vue, data: ToastType) {
      this.$toast({
        title: data.title,
        description: data.description,
        status: data.status,
        duration: 3000,
        position: 'top-right',
        isClosable: false
      })
    }
  }
}
