import { NextRequest, NextResponse } from 'next/server';
import { GlobalNomacResult, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const searchKey = request.nextUrl.searchParams.get('searchKey');
    const limit = request.nextUrl.searchParams.get('limit') || '50';

    if (!searchKey) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAMETER',
          message: 'searchKey is required',
          description: 'The searchKey parameter is mandatory for global search',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/search-global`);
    url.searchParams.append('searchKey', searchKey);
    url.searchParams.append('limit', limit);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = (await response.json()) as GlobalNomacResult[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Global search failed',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
