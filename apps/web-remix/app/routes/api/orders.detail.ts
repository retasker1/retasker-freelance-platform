import { json } from "react-router";
import { prisma } from "../../lib/prisma";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("id");
  
  if (!orderId) {
    throw new Response("Order ID is required", { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            photoUrl: true,
          },
        },
        deals: {
          include: {
            freelancer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Response("Order not found", { status: 404 });
    }

    return json(order);
  } catch (error) {
    console.error("Failed to load order:", error);
    throw new Response("Internal server error", { status: 500 });
  }
}

