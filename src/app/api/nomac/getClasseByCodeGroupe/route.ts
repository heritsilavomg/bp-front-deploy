import { NextRequest, NextResponse } from 'next/server';
import { ClasseEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const codeGroupe = request.nextUrl.searchParams.get('codeGroupe');

    if (!codeGroupe) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAMETER',
          message: 'codeGroupe is required',
          description: 'The codeGroupe parameter is mandatory (3 characters)',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (codeGroupe.length !== 3) {
      return NextResponse.json(
        {
          code: 'INVALID_PARAMETER',
          message: 'Invalid codeGroupe format',
          description: 'The codeGroupe must be exactly 3 characters long',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/getClasseByCodeGroupe`);
    url.searchParams.append('codeGroupe', codeGroupe);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = (await response.json()) as ClasseEntity[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve classes',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
