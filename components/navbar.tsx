import { auth } from "@clerk/nextjs/server"
import { UserButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation';
import { MainNav } from '../components/mainNav'
import StoreSwitcher from '../components/store-switcher';
import prismadb from '../lib/prismadb';



const Navbar = async () => {
    const { userId } = auth();

    if (!userId) {
        redirect('/sign-in')
    }
    const stores = await prismadb.store.findMany({
        where: {
            userId
        },
    });



    return (
        <div className='border-b'>
            <div className="flex gap-2 h-16 items-center px-2">
                <MainNav className='mx-1 ' />
                <StoreSwitcher items={stores} />
                <div className="ml-auto flex items-center space-x-4">
                    <UserButton afterSignOutUrl='/' />
                </div>
            </div>
        </div>
    );
}

export default Navbar;