import { create } from 'zustand';
import { Product } from '@/types';
interface PreviewModalStore {
     isOpen: boolean;
     data?: Product;
     onOpen: (product: Product) => void;
     onClose: () => void;
}

const usePreviewModal = create<PreviewModalStore>((set) => ({
     isOpen: false,
     data: undefined,
     onOpen: (data: Product) => set({ isOpen: true, data: data }),
     onClose: () => set({ isOpen: false })
}));


export default usePreviewModal