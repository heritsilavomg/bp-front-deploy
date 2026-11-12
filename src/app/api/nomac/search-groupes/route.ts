import { NextRequest, NextResponse } from 'next/server';
import { GroupeEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const searchKey = request.nextUrl.searchParams.get('searchKey') || '';

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/search-groupes`);
    if (searchKey) {
      url.searchParams.append('searchKey', searchKey);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = (await response.json()) as GroupeEntity[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Search failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
