// /api/auth/perfil/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";
import cloudinary from "@/libs/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";

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

export async function PUT(request: Request) {
  const connection = await connectDB();
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 });
    }

    const idUsuario = session.user.id;
    const formData = await request.formData();

    const informacion = formData.get("informacion")?.toString() || null;
    const ciudad = formData.get("ciudad")?.toString() || null;
    const clave_o_matricula = formData.get("clave_o_matricula")?.toString() || null;
    const numero_telefonico = formData.get("numero_telefonico")?.toString() || null;
    let fotoPerfilUrl = null;

    // Verificar si hay una URL de imagen pasada desde el cliente
    if (formData.has("foto_perfil")) {
      const fotoPerfilValue = formData.get("foto_perfil");
      if (fotoPerfilValue instanceof Blob) {
        const fotoBuffer = Buffer.from(await fotoPerfilValue.arrayBuffer());
        fotoPerfilUrl = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "perfiles" },
            (error, result) => {
              if (error) {
                reject(new Error("Error al subir la imagen a Cloudinary"));
              } else {
                resolve(result?.secure_url || null);
              }
            }
          );
          uploadStream.end(fotoBuffer);
        });
      } else if (typeof fotoPerfilValue === "string") {
        fotoPerfilUrl = fotoPerfilValue; // Si es una URL enviada directamente desde el cliente
      }
    }
    

    const updateQuery = `
      UPDATE perfil 
      SET 
        informacion = COALESCE(?, informacion),
        ciudad = COALESCE(?, ciudad),
        clave_o_matricula = COALESCE(?, clave_o_matricula),
        numero_telefonico = COALESCE(?, numero_telefonico),
        foto_perfil = COALESCE(?, foto_perfil)
      WHERE id_perfil = (SELECT perfil_id FROM usuario WHERE id_usuario = ?)
    `;

    const updateValues = [
      informacion,
      ciudad,
      clave_o_matricula,
      numero_telefonico,
      fotoPerfilUrl,
      idUsuario,
    ];

    await connection.execute(updateQuery, updateValues);

    return NextResponse.json({ message: "Perfil actualizado con éxito" }, { status: 200 });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    return NextResponse.json({ message: "Error al actualizar el perfil" }, { status: 500 });
  } finally {
    connection.release();
  }
}
