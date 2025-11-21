import { NextRequest, NextResponse } from 'next/server';
import { RSSImporter } from '@/lib/services/RSSImporter';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { country } = await request.json();
    
    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY not configured' },
        { status: 500 }
      );
    }

    const importer = new RSSImporter();

    let result;
    if (country) {
      // Преобразуем slug в code, если передан slug
      const countryData = await prisma.country.findUnique({
        where: { slug: country }
      });
      
      if (!countryData) {
        // Если не найден по slug, пробуем как code
        const countryByCode = await prisma.country.findUnique({
          where: { code: country.toUpperCase() }
        });
        
        if (!countryByCode) {
          return NextResponse.json(
            { error: `Country ${country} not found` },
            { status: 404 }
          );
        }
        
        result = await importer.importForCountry(countryByCode.code);
      } else {
        result = await importer.importForCountry(countryData.code);
      }
    } else {
      return NextResponse.json(
        { error: 'Country parameter is required' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: result.success ? 'success' : 'error',
      result
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Use POST to trigger import. Body: { "country": "ukraine" } or {} for all'
  });
}

