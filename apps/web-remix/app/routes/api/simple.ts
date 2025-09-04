export async function action({ request }: any) {
  console.log("Simple API called with method:", request.method);
  
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    console.log("Simple API received body:", body);

    return Response.json({
      success: true,
      message: "Simple API работает!",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Simple API error:", error);
    return Response.json({
      success: false,
      message: "Error: " + error.message
    });
  }
}
