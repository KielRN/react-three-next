import { NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge for fast streaming performance

async function handleRequest(request, { params }) {
  // Join the path array to forward to OpenRouter (e.g. 'chat/completions' or 'models')
  let pathArray = params?.path || [];
  // If the client appended an extra 'v1', strip it so we don't get /api/v1/v1/...
  if (pathArray[0] === 'v1') {
    pathArray = pathArray.slice(1);
  }
  const pathPrefix = pathArray.join('/');
  const targetUrl = `https://openrouter.ai/api/v1/${pathPrefix}`;

  // Simple authentication: Check if the request has the correct Bearer token.
  // This matches the "API Key" you will configure in Cline on your work computer.
  const authHeader = request.headers.get('authorization');
  const expectedAuth = `Bearer ${process.env.PROXY_SECRET}`;
  
  if (process.env.PROXY_SECRET && authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized: Invalid API Key' }, { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OPENROUTER_API_KEY not configured on the proxy server' }, { status: 500 });
  }

  // Set up the headers to send to OpenRouter
  const newHeaders = new Headers();
  newHeaders.set('Content-Type', 'application/json');
  newHeaders.set('Authorization', `Bearer ${process.env.OPENROUTER_API_KEY}`);
  
  // Optional: OpenRouter tracking headers
  newHeaders.set('HTTP-Referer', 'https://texasai.com'); 
  newHeaders.set('X-Title', 'TexasAI AI Proxy');

  try {
    const fetchOptions = {
      method: request.method,
      headers: newHeaders,
      // GET requests cannot have a body
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
    };

    const response = await fetch(targetUrl, fetchOptions);

    // Forward the streaming response back to the client (Cline)
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Proxy Error' }, { status: 500 });
  }
}

// Map the HTTP methods Cline might use
export const GET = handleRequest;
export const POST = handleRequest;
export const OPTIONS = handleRequest;
