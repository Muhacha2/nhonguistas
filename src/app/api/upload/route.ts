// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  const { file } = await request.json();

  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: 'auto',
    });

    // Certifique-se de que result e suas propriedades existem antes de desestruturar
    if (result && result.secure_url && result.resource_type) {
      const { secure_url, resource_type } = result;
      return NextResponse.json({ secure_url, resource_type });
    } else {
      // Caso em que o upload pode ter "sucedido" mas não retornou o que esperávamos
      throw new Error('Cloudinary returned an invalid result.');
    }

  } catch (error) {
    console.error('Upload API error:', error);
    // Tenta passar uma mensagem de erro mais específica, se disponível
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file to Cloudinary';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
