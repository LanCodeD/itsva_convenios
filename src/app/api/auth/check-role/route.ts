import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/authOptions";
import { NextResponse } from "next/server";
import { connectDB } from "@/libs/database";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const connection = await connectDB();
  const [rows]: any = await connection.execute(
    'SELECT rol FROM usuario WHERE correo = ?',
    [session.user.email]
  );
  connection.release();

  const userRole = rows[0]?.rol;

  return NextResponse.json({ rol: userRole });
}
