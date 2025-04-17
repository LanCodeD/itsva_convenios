// /api/auth/login.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/libs/database'; // Asegúrate de que esta función está definida correctamente para conectar con tu base de datos

export async function login(request: Request) {
    const { correo, contraseña } = await request.json();
    const connection = await connectDB();
  
    // Verificar si el usuario existe
    const [rows]: any = await connection.execute('SELECT * FROM usuario WHERE correo = ?', [correo]);
  
    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "Correo no encontrado" }, { status: 401 });
    }
  
    const user = rows[0];
  
    // Verificar la contraseña
    const isValidPassword = await bcrypt.compare(contraseña, user.contraseña);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Contraseña incorrecta" }, { status: 401 });
    }
  
    // Aquí puedes establecer el token JWT o la sesión
    const userRole = user.rol; // Aquí se define el rol del usuario
  
    return NextResponse.json({
      message: "Inicio de sesión exitoso",
      rol: userRole, // Retorna el rol
    });
  }
  