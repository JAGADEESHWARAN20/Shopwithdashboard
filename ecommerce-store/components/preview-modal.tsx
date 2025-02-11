"use client"

import usePreviewModal from "@/hooks/use-preview-modal";
import Model from "./ui/modal";
import Gallery from "./gallery";
import { MobileGallery } from "./gallery/mobile-gallery";
import Info from "./info";

const PreviewModal = () => {
     const previewModal = usePreviewModal();
     const product = usePreviewModal((state) => state.data);

     if (!product) {
          return null;
     }

     return (
          <Model open={previewModal.isOpen} onClose={previewModal.onClose}>
               <div className=" grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">

                    <div className="sm:col-span-4 lg:col-span-5">
                         {/* Mobile view */}
                         <div className="sm:block hidden lg:hidden">
                              <MobileGallery images={product.images.map((img) => img.url)} />
                         </div>
                         {/* Large device view */}
                         <div className="sm:hidden lg:block">
                              <Gallery images={product.images} />
                         </div>

                    </div>
                    <div className="sm:col-span-8 lg:col-span-7">
                         <Info data={product} />
                    </div>
               </div>
          </Model>
     );
}

export default PreviewModal;