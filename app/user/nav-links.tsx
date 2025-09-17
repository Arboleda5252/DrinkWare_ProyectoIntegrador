import { FaUsersCog } from "react-icons/fa";
import { RiArticleFill } from "react-icons/ri";
import { FcSalesPerformance } from "react-icons/fc";

const links = [
  { 
    name: 'Gestión de Usuarios', 
    href: '/user', 
    icon: <FaUsersCog className="w-7"/> 
  },
  {
    name: 'Gestión de Productos',
    href: '/user/products',
    icon: <RiArticleFill className="w-7"/>,
  },
  { name: 'Reporte de Ventas', 
    href: '/user/repVentas', 
    icon: <FcSalesPerformance className="w-7"/>
  },
];

export default function NavLinks() {
  return (
    <>
      {links.map((link) => {
        return (
          <a
            key={link.name}
            href={link.href}
            className="flex h-[48px] grow items-center context-start gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <p className="item-start">{link.icon}</p>
            <p className="hidden md:block">{link.name}</p>
          </a>
        );
      })}
    </>
  );
}
