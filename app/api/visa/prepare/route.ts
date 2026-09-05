import { NextRequest, NextResponse } from 'next/server';
import { getVisaOptionById } from '@/lib/visa-data';
import { VisaContextBundle } from '@/types/interview';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const visaType = body.visa_type;

    if (!visaType || typeof visaType !== 'string') {
      return NextResponse.json(
        { error: 'A valid visa_type is required.' },
        { status: 400 }
      );
    }

    const visaOption = getVisaOptionById(visaType);
    if (!visaOption) {
      return NextResponse.json(
        { error: `Unknown visa type: ${visaType}` },
        { status: 400 }
      );
    }

    const contextBundle: VisaContextBundle = {
      mode: 'visa',
      visa_type: visaOption.id,
      destination_country: visaOption.destinationCountry,
      category_name: visaOption.name,
    };

    return NextResponse.json({
      success: true,
      context_bundle: contextBundle,
    });
  } catch (error: any) {
    console.error('Visa prepare error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to prepare visa context.' },
      { status: 500 }
    );
  }
}
