import { Billboard as BillboardType } from "@/types"

interface BillboardProps {
     data: BillboardType
};

const Billboard: React.FC<BillboardProps> = ({ data }) => {
     return (
          <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
               <div className="relative rounded-xl aspect-square md:aspect-[2.4/1] overflow-hidden bg-cover" style={{ backgroundImage: `url(${data?.imageUrl})` }}>
                    <div className="h-full w-full flex flex-col items-center justify-center text-center gap-y-7">
                         <div className="font-bold text-white text-opacity-15 text-3xl sm:text-5xl lg:text-6xl sm:max-w-xl max-w-xs ">
                              {data.label}
                         </div>
                    </div>
               </div>

          </div>
     )
}

export default Billboard
