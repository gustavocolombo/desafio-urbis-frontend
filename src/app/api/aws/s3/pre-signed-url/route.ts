import axios from "axios";
import { NextResponse } from "next/server"; 

export async function POST(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

  try {
    const { fileNameLocator } = await request.json(); 

    const response = await axios.post(
      `${API_URL}/api/aws/s3/pre-signed-url`,
      { fileNameLocator }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Erro ao gerar URL assinada", error);
    return NextResponse.json({ error: "Erro ao gerar URL assinada" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Método GET não permitido" }, { status: 405 });
}
