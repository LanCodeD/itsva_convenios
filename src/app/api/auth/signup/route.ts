import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const connection = await connectDB();

  try {
    const {
      nombre,
      apellido,
      correo,
      contraseña,
      informacion,
      ciudad,
      clave_o_matricula,
      numero_telefonico,
      rol,
    } = await request.json();

    // Validar campos obligatorios
    if (!nombre || !apellido || !correo || !contraseña) {
      return NextResponse.json(
        { message: "El campo Usuario es OBLIGATORIO" },
        { status: 400 }
      );
    }

    // Validar longitud de la contraseña
    if (contraseña.length < 6) {
      return NextResponse.json(
        { message: "La contraseña debe tener al menos 6 carácteres" },
        { status: 400 }
      );
    }

    // Verificar si el correo ya existe
    const [userRows] = await connection.execute<any[]>(
      "SELECT * FROM usuario WHERE correo = ?",
      [correo]
    );

    if (userRows.length > 0) {
      return NextResponse.json(
        { message: "El correo electrónico ya existe" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(contraseña, 12);

    // Iniciar la transacción
    await connection.beginTransaction();

    // Determinar el rol (por defecto será 'usuario' si no se proporciona)
    const userRole = rol || "usuario";

    // Crear el usuario con el rol
    const [userResult]: any = await connection.execute(
      "INSERT INTO usuario (nombre, apellido, correo, contraseña, perfil_id, rol) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, apellido, correo, hashedPassword, null, userRole]
    );
    const nuevoUsuarioId = userResult.insertId;

    // Crear el perfil
    const [profileResult]: any = await connection.execute(
      "INSERT INTO perfil (informacion, ciudad, clave_o_matricula, numero_telefonico) VALUES (?, ?, ?, ?)",
      [informacion, ciudad, clave_o_matricula, numero_telefonico]
    );
    const nuevoPerfilId = profileResult.insertId;

    // Actualizar el usuario con perfil_id
    await connection.execute(
      "UPDATE usuario SET perfil_id = ? WHERE id_usuario = ?",
      [nuevoPerfilId, nuevoUsuarioId]
    );

    // Confirmar la transacción
    await connection.commit();

    return NextResponse.json(
      { message: "Usuario registrado con éxito" },
      { status: 201 }
    );
  } catch (error) {
    // Revertir la transacción en caso de error
    await connection.rollback();
    console.error("Error al crear usuario y perfil:", error);
    return NextResponse.json({ message: "Fallo al crear" }, { status: 405 });
  } finally {
    connection.release(); // Devuelve la conexión al database "pool"
  }
}
//funciones para el administrador 
export async function GET(request: Request) {
  const connection = await connectDB();

  try {
    // Total de usuarios
    const [totalUsuariosRows]: any = await connection.execute(
      "SELECT COUNT(*) as total FROM usuario"
    );
    const totalUsuarios = totalUsuariosRows[0].total;
    

    // Usuarios registrados en el último mes
    const [usuariosMesRows]: any = await connection.execute(`
    SELECT COUNT(*) as total 
    FROM usuario 
    WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 1 MONTH);

    `);
    const usuariosMes = usuariosMesRows[0].total;
    

    // Usuarios activos (que han hecho alguna solicitud en el último mes)
    const [usuariosActivosRows]: any = await connection.execute(`
      SELECT COUNT(DISTINCT usuario_id) as total FROM solicitudes_convenios 
      WHERE fecha_creacion >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);
    const usuariosActivos = usuariosActivosRows[0].total;
  

    return new Response(
      JSON.stringify({
        totalUsuarios,
        usuariosMes,
        usuariosActivos,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener estadísticas de usuarios:", error);
    return new Response(
      JSON.stringify({ message: "Error al obtener estadísticas" }),
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
