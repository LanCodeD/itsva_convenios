import path from "path";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Ruta absoluta del archivo
  const filePath = path.join(
    process.cwd(),
    "uploads",
    "Itsva",
    "Convenios",
    filename
  );

  try {
    const fileBuffer = await fs.readFile(filePath);

    // Detecta tipo MIME simple
    const contentType = filename.endsWith(".pdf")
      ? "application/pdf"
      : "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("Archivo no encontrado:", err.message);
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }
}
