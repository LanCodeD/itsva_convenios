// /api/auth/perfil/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import fs from "fs/promises";
import path from "path";




export async function GET(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const id_usuario = session.user.id;

    const [rows]: any[] = await connection.execute(
      `SELECT perfil.* FROM usuario 
       JOIN perfil ON usuario.perfil_id = perfil.id_perfil 
       WHERE usuario.id_usuario = ?`, 
      [id_usuario]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Perfil no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ perfil: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return NextResponse.json({ message: "Error al obtener el perfil" }, { status: 500 });
  } finally {
    connection.release();
  }
}

// 0) Indicamos que esto corre en Node.js
export const runtime = 'nodejs';

export async function PUT(request: Request) {
  const connection = await connectDB();
  try {
    // 1) Autenticación
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }
    const idUsuario = session.user.id;

    // 2) Parsear formData
    const formData = await request.formData();
    const informacion      = formData.get("informacion")?.toString()      || null;
    const ciudad           = formData.get("ciudad")?.toString()           || null;
    const clave_o_matricula= formData.get("clave_o_matricula")?.toString()|| null;
    const numero_telefonico= formData.get("numero_telefonico")?.toString()|| null;
    const nuevaFotoUrl     = formData.get("foto_perfil")?.toString()      || null;

    // 3) Si vienen nuevos datos de foto, borramos la antigua
    if (nuevaFotoUrl) {
      const [rows]: any[] = await connection.execute(
        `SELECT foto_perfil 
           FROM perfil 
          WHERE id_perfil = (
            SELECT perfil_id 
              FROM usuario 
             WHERE id_usuario = ?
          )`,
        [idUsuario]
      );
      const viejaFotoUrl = rows[0]?.foto_perfil as string | null;
      if (viejaFotoUrl && viejaFotoUrl !== nuevaFotoUrl) {
        const filePath = path.join(
          process.cwd(),
          "public",
          viejaFotoUrl.replace(/^\//, "")
        );
        await fs.unlink(filePath).catch((e: any) => {
          if (e.code !== "ENOENT") console.error("Error borrando foto vieja:", e);
        });
      }
    }

    // 4) Construir y ejecutar el UPDATE
    const updateQuery = `
      UPDATE perfil
         SET 
           informacion       = COALESCE(?, informacion),
           ciudad            = COALESCE(?, ciudad),
           clave_o_matricula = COALESCE(?, clave_o_matricula),
           numero_telefonico = COALESCE(?, numero_telefonico),
           foto_perfil       = COALESCE(?, foto_perfil)
       WHERE id_perfil = (
         SELECT perfil_id FROM usuario WHERE id_usuario = ?
       )
    `;
    const updateValues = [
      informacion,
      ciudad,
      clave_o_matricula,
      numero_telefonico,
      nuevaFotoUrl,
      idUsuario,
    ];
    await connection.execute(updateQuery, updateValues);

    return NextResponse.json(
      { message: "Perfil actualizado con éxito" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al actualizar el perfil:", error);
    return NextResponse.json(
      { message: "Error al actualizar el perfil" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
