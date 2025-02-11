import IconButton from '@/components/ui/icon-button';
import { Product } from '@/types';
import { X } from 'lucide-react';
import Image from 'next/image';

interface CartItemProps {
     data: Product;
}

const CartItems: React.FC<CartItemProps> = ({ data }) => {
     return (
          <li className="flex py-6 border-b">
               <div className="relative h-24 w-24 rounded-md overflow-hidden sm:h-48 sm:w-48">
                    <Image fill src={data.images[0].url} alt="" className='object-cover object-center' />
               </div>
               <div className="relative ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className='absolute z-0 right-0 top-0'>
                         <IconButton onClick={() => { }} icon={<X size={15} />}>
                         </IconButton>
                    </div>
                    <div className="relative pr-9 sm:grid-cols-2 sm:gap-x-6">

                    </div>
               </div>

          </li>
     )

}

export default CartItems;