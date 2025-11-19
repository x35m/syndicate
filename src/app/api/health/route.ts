import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Проверяем подключение к БД
    await prisma.$queryRaw`SELECT 1`;
    
    // Считаем статьи
    const articleCount = await prisma.article.count();
    
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      articles: articleCount,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    }, { status: 500 });
  }
}
