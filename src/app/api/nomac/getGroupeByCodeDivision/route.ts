import { NextRequest, NextResponse } from 'next/server';
import { GroupeEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const codeDivision = request.nextUrl.searchParams.get('codeDivision');

    if (!codeDivision) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAMETER',
          message: 'codeDivision is required',
          description: 'The codeDivision parameter is mandatory (2 characters)',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (codeDivision.length !== 2) {
      return NextResponse.json(
        {
          code: 'INVALID_PARAMETER',
          message: 'Invalid codeDivision format',
          description: 'The codeDivision must be exactly 2 characters long',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/getGroupeByCodeDivision`);
    url.searchParams.append('codeDivision', codeDivision);

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
      message: 'Failed to retrieve groupes',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
