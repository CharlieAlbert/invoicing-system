export async function POST(request: Request) {
  return new Response(
    JSON.stringify({ 
      error: "This endpoint has been deprecated. PDF generation now happens client-side using @react-pdf/renderer." 
    }),
    { 
      status: 410, // Gone
      headers: { "Content-Type": "application/json" }
    }
  );
}