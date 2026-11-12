import { NextRequest, NextResponse } from 'next/server';
import { DivisionEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const codeSection = request.nextUrl.searchParams.get('codeSection');

    if (!codeSection) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAMETER',
          message: 'codeSection is required',
          description: 'The codeSection parameter is mandatory (1 character)',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (codeSection.length !== 1) {
      return NextResponse.json(
        {
          code: 'INVALID_PARAMETER',
          message: 'Invalid codeSection format',
          description: 'The codeSection must be exactly 1 character long',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/getDivisionByCodeSection`);
    url.searchParams.append('codeSection', codeSection);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = (await response.json()) as DivisionEntity[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve divisions',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
