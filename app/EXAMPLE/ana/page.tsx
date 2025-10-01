import { BiAngry } from "react-icons/bi";
import { BiSolidDrink } from "react-icons/bi";

export default function Page() {
  return (
    <div className="flex flex-row justify-items-end-safe bg-sky-400">
      hola ANA
      <div className="flex flex-col bg-yellow-500 text-white">Hola Karen
        <div className="text-7xl">Adios</div>
      </div>
      <div>Hola Duvan <BiSolidDrink className="text-5xl text-red-500"/></div>
      <div className="text-8xl text-blue-600 bg-green-400 text-left p-20 m-8">
        Este es un texto grande, azul, con fondo verde y alineado a la izquierda.
      </div>

    </div>

  );
}
