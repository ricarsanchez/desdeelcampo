import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    variables: {
      SUPABASE_URL: process.env.SUPABASE_URL !== undefined,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY !== undefined,
      SUPABASE_KEY: process.env.SUPABASE_KEY !== undefined,
    },
  });
}
