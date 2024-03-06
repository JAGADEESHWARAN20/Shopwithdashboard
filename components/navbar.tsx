import { UserButton } from '@clerk/nextjs'

import { MainNav } from '@/components/mainNav'


const Navbar = () => {
    return ( 
        <div className='border-b'>
            <div className="flex h-16 items-center px-4">
                <div className="">
                    This will be a store switcher
                </div>
                <MainNav className='mx-6' />
                <div className="ml-auto flex items-center space-x-4">
                    <UserButton afterSignOutUrl='/'/>
                </div>
            </div>
        </div>
     );
}
 
export default Navbar;