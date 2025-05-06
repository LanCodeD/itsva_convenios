// app/api/serverL/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// 0) Indicamos que esto corre en Node.js
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // 1) Parse multipart con la Web API
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  // 2) Validar tamaño (10 MB máximo)
  const MAX = 5 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json(
      { error: "El archivo excede el tamaño máximo (5 MB)" },
      { status: 413 }
    );
  }

  // 3) Extraer base y extensión de file.name
  const originalName = file.name;                   // "22070000_Raul_Ku.pdf"
  const parts = originalName.split(".");
  const ext = parts.pop() || "";                    // "pdf"
  const baseRaw = parts.join(".");                  // "22070000_Raul_Ku"
  // Opcional: sanear espacios, etc.
  const base = baseRaw.trim().replace(/\s+/g, "_");

  // 4) Preparar carpeta y buscar colisiones
  const uploadDir = path.join(process.cwd(), "public", "Itsva", "Convenios");
  await fs.mkdir(uploadDir, { recursive: true });

  let fileName = `${base}.${ext}`;                   // Primer intento
  let counter = 1;
  // Mientras exista un fichero con ese nombre, añado sufijo
  while (true) {
    try {
      await fs.access(path.join(uploadDir, fileName));
      // si no lanza error, el fichero ya existe → genero siguiente
      fileName = `${base}_${counter}.${ext}`;
      counter++;
    } catch {
      // si lanza ENOENT significa que no existe: salgo del bucle
      break;
    }
  }

  // 5) Escribirlo en disco
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  // 6) Devolver la URL pública
  const publicUrl = `/Itsva/Convenios/${fileName}`;
  return NextResponse.json({ url: publicUrl }, { status: 201 });
}

