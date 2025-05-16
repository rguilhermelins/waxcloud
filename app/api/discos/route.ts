import { NextRequest, NextResponse } from 'next/server';

let discos: any[] = [];

export async function GET() {
  return NextResponse.json({ success: true, data: discos });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const novoDisco = { ...body, id: Date.now() };
  discos.push(novoDisco);
  return NextResponse.json({ success: true, data: novoDisco });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...rest } = body;
  discos = discos.map(disco => disco.id === id ? { ...disco, ...rest } : disco);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  discos = discos.filter(disco => disco.id !== id);
  return NextResponse.json({ success: true });
} 