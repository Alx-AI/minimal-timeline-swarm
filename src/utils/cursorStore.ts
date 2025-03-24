import { create } from 'zustand';

interface CursorState {
  x: number;
  y: number;
  updatePosition: (x: number, y: number) => void;
}

const useCursorStore = create<CursorState>((set) => ({
  x: 0,
  y: 0,
  updatePosition: (x, y) => set({ x, y }),
}));

export default useCursorStore; 