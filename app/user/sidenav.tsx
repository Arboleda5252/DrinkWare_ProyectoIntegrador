import Link from 'next/link';
import NavLinks from '@/app/user/nav-links';
import Image from 'next/image';


export default function SideNav() {
  return (
    <div className="flex h-full flex-col px-1 py-3 md:px-4">
      <Link
        className="mb-1 flex h-8 rounded-md bg-blue-500 p-2 md:h-40"
        href="/user"
      >
        <div className='justify-center items-center content-center w-full'>
          <div className="flex flex-col items-center text-white">
          <Image
            src="/Logos/LogoAdmin.png"
            alt="Logo"
            width={50}
            height={50}
            className='brightness-0 invert'
          />
          <p className="text-[25px]">Admin</p>
        </div>
        </div>
        
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-1 md:space-y-1">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
      </div>
    </div>
  );
}
