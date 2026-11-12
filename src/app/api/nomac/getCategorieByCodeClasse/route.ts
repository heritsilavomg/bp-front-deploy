import { NextRequest, NextResponse } from 'next/server';
import { CategorieEntity, ErrorResponse } from '@/types/nomac';

export async function GET(request: NextRequest) {
  try {
    const codeClasse = request.nextUrl.searchParams.get('codeClasse');

    if (!codeClasse) {
      return NextResponse.json(
        {
          code: 'MISSING_PARAMETER',
          message: 'codeClasse is required',
          description: 'The codeClasse parameter is mandatory (4 characters)',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (codeClasse.length !== 4) {
      return NextResponse.json(
        {
          code: 'INVALID_PARAMETER',
          message: 'Invalid codeClasse format',
          description: 'The codeClasse must be exactly 4 characters long',
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const url = new URL(`${process.env.SPRING_BOOT_API}/nomac/getCategorieByCodeClasse`);
    url.searchParams.append('codeClasse', codeClasse);

    const response = await fetch(url.toString(), {
      method: 'GET',
    });

    const data = (await response.json()) as CategorieEntity[];

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    const errorResponse: ErrorResponse = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to retrieve categories',
      description: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
