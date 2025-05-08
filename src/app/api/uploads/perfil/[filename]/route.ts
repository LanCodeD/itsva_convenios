import { NextRequest } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;
  const filePath = path.join(
    process.cwd(),
    "uploads",
    "Itsva",
    "Perfil",
    filename
  );

  try {
    const fileBuffer = await fs.readFile(filePath);
    const fileExt = path.extname(filename).toLowerCase();

    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };

    const contentType = mimeTypes[fileExt] || "application/octet-stream";

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return new Response("Archivo no encontrado", { status: 404 });
  }
}
