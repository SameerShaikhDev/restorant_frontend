import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  totalAmount: 0,
  itemCount: 0,

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.menuItemId === item.menuItemId)
      let newItems
      
      if (existingItem) {
        newItems = state.items.map((i) =>
          i.menuItemId === item.menuItemId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        )
      } else {
        newItems = [...state.items, { ...item, quantity: item.quantity || 1 }]
      }
      
      const totalAmount = newItems.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0)
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0)
      
      return { items: newItems, totalAmount, itemCount }
    })
  },

  removeItem: (menuItemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i.menuItemId !== menuItemId)
      const totalAmount = newItems.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0)
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0)
      return { items: newItems, totalAmount, itemCount }
    })
  },

  updateQuantity: (menuItemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        const newItems = state.items.filter((i) => i.menuItemId !== menuItemId)
        const totalAmount = newItems.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0)
        const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0)
        return { items: newItems, totalAmount, itemCount }
      }
      
      const newItems = state.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity } : i
      )
      const totalAmount = newItems.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0)
      const itemCount = newItems.reduce((sum, i) => sum + i.quantity, 0)
      return { items: newItems, totalAmount, itemCount }
    })
  },

  clearCart: () => {
    set({ items: [], totalAmount: 0, itemCount: 0 })
  },

  getTotal: () => {
    const state = get()
    return {
      subtotal: state.totalAmount,
      tax: state.totalAmount * 0.1,
      total: state.totalAmount * 1.1,
    }
  },
}))

export default useCartStore