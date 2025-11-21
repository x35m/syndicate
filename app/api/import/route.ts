import { NextRequest, NextResponse } from 'next/server';
import { RSSImporter } from '@/lib/services/RSSImporter';

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

    const importer = new RSSImporter(groqApiKey);

    let result;
    if (country) {
      // Импорт для конкретной страны
      result = await importer.importForCountry(country);
    } else {
      // Импорт для всех стран
      result = await importer.importAll();
    }

    return NextResponse.json({
      status: 'success',
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

