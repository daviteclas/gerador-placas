// src/store/useQueueStore.ts
import { create } from 'zustand';
import type { ItemFilaPlaca } from '../types';

interface QueueState {
  // Estado
  layoutSelecionado: string | null;
  filaPlacas: ItemFilaPlaca[];
  
  // Ações
  setLayoutSelecionado: (layout: string) => void;
  adicionarPlaca: (item: ItemFilaPlaca) => void;
  removerPlaca: (id: string) => void;
  limparFila: () => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  layoutSelecionado: null,
  filaPlacas: [],

  setLayoutSelecionado: (layout) => set({ layoutSelecionado: layout }),
  
  adicionarPlaca: (item) => set((state) => ({ 
    filaPlacas: [...state.filaPlacas, item] 
  })),
  
  removerPlaca: (id) => set((state) => ({ 
    filaPlacas: state.filaPlacas.filter(item => item.id !== id) 
  })),
  
  limparFila: () => set({ filaPlacas: [] }),
}));