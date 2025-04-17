import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";


export async function GET(request: Request) {
  const connection = await connectDB();

  try {
    // Consulta para obtener todos los documentos en la tabla descargar_formato
    const [rows]: any[] = await connection.execute(
      `SELECT id_descargar_formato, documento, link FROM descargar_formato`
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "No se encontraron documentos" }, { status: 404 });
    }

    // Opcional: Puedes realizar más transformaciones aquí si es necesario

    return NextResponse.json({ documentos: rows }, { status: 200 });

  } catch (error) {
    console.error("Error al obtener los documentos:", error);
    return NextResponse.json({ message: "Error al obtener los documentos" }, { status: 500 });
  } finally {
    connection.release(); //Devuleve la conexión al databese "pool"
  }
}
