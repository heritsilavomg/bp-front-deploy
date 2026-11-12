import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          code: 'INVALID_REQUEST',
          message: 'File is required',
          description: 'A file must be provided in the request body',
        },
        { status: 400 }
      );
    }

    // Forward to backend API
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(`${process.env.SPRING_BOOT_API}/nomac/import`, {
      method: 'POST',
      body: backendFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Import failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
