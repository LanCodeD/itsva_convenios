// app/api/serverProfile/route.ts
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
// Si no lo usas para darle nombre único al archivo, puedes eliminar este import:
// import { v4 as uuid } from "uuid";

// 1) Indicamos que esto corre en Node.js
export const runtime = 'nodejs';

export async function POST(request: Request) {
  // 2) parsear multipart/form-data
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 });
  }

  // 3) validar tamaño (5 MB)
  const MAX = 5 * 1024 * 1024;
  if (file.size > MAX) {
    return NextResponse.json(
      { error: "El archivo excede el tamaño máximo (5 MB)" },
      { status: 413 }
    );
  }

  // 4) extraer nombre base y extensión
  const parts = file.name.split(".");
  const ext = parts.pop() || "";
  const baseRaw = parts.join(".");
  const base = baseRaw.trim().replace(/\s+/g, "_");

  // 5) carpeta de destino
  const uploadDir = path.join(process.cwd(), "uploads", "Itsva", "Perfil");
  await fs.mkdir(uploadDir, { recursive: true });

  // 6) evitar colisiones (añadir _1, _2…)
  let fileName = `${base}.${ext}`;
  let counter = 1;
  while (
    await fs
      .access(path.join(uploadDir, fileName))
      .then(() => true)
      .catch(() => false)
  ) {
    fileName = `${base}_${counter}.${ext}`;
    counter++;
  }

  // 7) grabar en disco
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadDir, fileName), buffer);

  // 8) devolver URL pública
  const publicUrl = `/api/uploads/perfil/${fileName}`; // nuevo
  return NextResponse.json({ url: publicUrl }, { status: 201 });
}
