import axios from "axios";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export async function GET() {
  try {
    const response = await axios.get(`${API_URL}/api/users/insert-status`);

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Erro ao verificar o status do processo", error);
    return NextResponse.json({ error: "Erro ao verificar o status do processo" }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: "Método POST não permitido" }, { status: 405 });
}
