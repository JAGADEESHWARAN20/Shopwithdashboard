"use client"

import Image from "next/image";
import { TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Image as ImageType } from "@/types"
import GalleryTab from "./gallery-tab";

interface galleryProps {
     images: ImageType[];
}

const Gallery: React.FC<galleryProps> = ({
     images
}) => {

     return (
          <>
               <TabGroup as="div" className="flex flex-col-reverse">
                    <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                         <TabList className={`grid grid-cols-4 gap-6`}>
                              {images.map((Image) => (
                                   <GalleryTab key={Image.id} image={Image} />
                              ))}
                         </TabList>
                    </div>
                    <TabPanels className="aspect-square w-full">
                         {images.map((image) => (
                              <TabPanel key={image.id}>
                                   <div className="aspect-square relative w-full h-full sm:rounded-lg overflow-hidden">
                                        <Image fill src={image.url} alt="Image" className="object-cover object-center" />
                                   </div>

                              </TabPanel>
                         ))}
                    </TabPanels>
               </TabGroup>
          </>
     )

}
export default Gallery;