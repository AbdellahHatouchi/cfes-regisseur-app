import { create } from 'zustand'

interface DeleteManyModal {
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
}

export const useDeleteManyModal = create<DeleteManyModal>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false })
}))
