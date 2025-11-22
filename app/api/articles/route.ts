import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const country = searchParams.get('country');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Формируем фильтры
    const where: any = {};
    
    if (country) {
      const countryData = await prisma.country.findUnique({
        where: { slug: country }
      });
      if (countryData) {
        where.countryId = countryData.id;
      }
    }
    
    if (category) {
      where.category = category;
    }

    // Получаем статьи
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          url: true,
          content: true,
          rewrittenContent: true,
          summary: true,
          publishedAt: true,
          category: true,
          source: { select: { name: true } },
          country: { select: { name: true, slug: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where })
    ]);

    return NextResponse.json({
      status: 'ok',
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        url: article.url,
        content: article.content,
        rewrittenContent: article.rewrittenContent,
        summary: article.summary,
        publishedAt: article.publishedAt,
        category: article.category,
        source: article.source.name,
        country: article.country ? {
          name: article.country.name,
          slug: article.country.slug
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

