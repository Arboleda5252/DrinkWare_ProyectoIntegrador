type Usuario = {
  idusuario: number;
  nombre: string;
  apellido: string;
  tipoDocumento: string | null;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  ciudad: string | null;
  direccion: string | null;
  nombreUsuario: string;
};

async function getUsuarios(): Promise<Usuario[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/usuarios`, {
    // En SSR, Next resuelve ruta relativa si no hay BASE_URL,
    // así que también funciona con '/api/usuarios'
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al cargar usuarios');
  return res.json();
}

export default async function UsuariosPage() {
  const usuarios = await getUsuarios();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Usuarios</h1>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Tipo Doc</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Usuario</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50/50">
            {usuarios.map(u => (
              <tr key={u.idusuario} className="[&>td]:px-3 [&>td]:py-2">
                <td>{u.idusuario}</td>
                <td>{u.nombre}</td>
                <td>{u.apellido}</td>
                <td>{u.tipoDocumento ?? '-'}</td>
                <td>{u.documento ?? '-'}</td>
                <td>{u.telefono ?? '-'}</td>
                <td>{u.email ?? '-'}</td>
                <td>{u.ciudad ?? '-'}</td>
                <td>{u.direccion ?? '-'}</td>
                <td className="font-medium">{u.nombreUsuario}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}