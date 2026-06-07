const VERIFY_TOKEN = "desdeelcampo2026";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('hub.challenge');
  const verifyToken = searchParams.get('hub.verify_token');

  if (verifyToken === VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Instagram webhook POST body:', JSON.stringify(body));
  } catch (err) {
    console.log('Instagram webhook POST body: <invalid json>', err);
  }

  return new Response('OK', { status: 200 });
}
