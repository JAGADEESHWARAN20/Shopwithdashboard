import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
     Carousel,
     CarouselContent,
     CarouselItem,
} from "@/components/ui/carousal"

interface MobileGalleryProps {
     images: string[]
}

export function MobileGallery({ images }: MobileGalleryProps) {
     return (
          // Hide on large devices
          <div className="lg:hidden">
               <Carousel className="w-full">
                    <CarouselContent>
                         {images.map((image, index) => (
                              <CarouselItem key={index} className="rounded-lg">
                                   <div className="p-1 rounded-lg">
                                        <Card className="rounded-xl">
                                             <CardContent className="flex aspect-[9/11] items-center justify-center p-0 rounded-lg ">
                                                  <img
                                                       src={image}
                                                       alt={`Image ${index + 1}`}
                                                       className="object-cover w-full h-full rounded-lg"
                                                  />
                                             </CardContent>
                                        </Card>
                                   </div>
                              </CarouselItem>
                         ))}
                    </CarouselContent>
               </Carousel>
          </div>
     )
}