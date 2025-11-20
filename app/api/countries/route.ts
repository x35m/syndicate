import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      include: {
        languages: true,
        aiSettings: true,
        _count: {
          select: {
            sources: true,
            articles: true,
          },
        },
      },
    });

    return NextResponse.json({
      status: 'ok',
      count: countries.length,
      countries: countries.map(country => ({
        code: country.code,
        name: country.name,
        slug: country.slug,
        isActive: country.isActive,
        languages: country.languages.map(l => ({
          code: l.languageCode,
          name: l.languageName,
          isDefault: l.isDefault,
        })),
        hasAISettings: !!country.aiSettings,
        stats: {
          sources: country._count.sources,
          articles: country._count.articles,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

