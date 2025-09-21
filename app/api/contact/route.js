import { NextResponse } from 'next/server';

export async function POST(request) {
  const data = await request.json();
  const webhookUrl = process.env.NEXT_PUBLIC_CONTACT_WEBHOOK;

  if (!webhookUrl) {
    return NextResponse.json({ message: 'Webhook URL is not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to submit to webhook');
    }

    const result = await response.text();
    return new Response(result, { status: response.status });
  } catch (error) {
    return NextResponse.json({ message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}