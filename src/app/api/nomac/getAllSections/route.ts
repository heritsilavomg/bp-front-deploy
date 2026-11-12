import { NextRequest, NextResponse } from 'next/server';
import { SectionEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.SPRING_BOOT_API}/nomac/getAllSections`, {
      method: 'GET',
    });

    const data = (await response.json()) as SectionEntity[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve sections',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
