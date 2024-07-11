import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

interface ProductOrder {
  product_id: number;
  quantity: number;
  deliveryAddress: string;
  storeAddress: string;
  sellerId: number;
  deliveryType: "delivery" | "pickup";
}




const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
  // debug: true, // Remove this line or set to false
  // logger: true, // Remove this line or set to false
});



async function sendConfirmationEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: "hirunipraveesha18@gmail.com",
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email sending failed");
  }
}


export async function GetDeliveryDetails(req: Request, res: Response) {
  const { buyerId } = req.query;

  if (!buyerId) {
    return res.status(400).json({ error: "Invalid or missing user ID" });
  }

  try {
    const user = await prisma.buyers.findUnique({
      where: {
        buyer_id: Number(buyerId),
      },
      select: {
        contactNo: true,
        addresses: {
          select: {
            line1: true,
            line2: true,
            city: true,
            postalCode: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function GetSellerAddress(req: Request, res: Response) {
  const { sellerId } = req.query;

  if (!sellerId) {
    return res.status(400).json({ error: "Invalid or missing seller ID" });
  }

  try {
    const seller = await prisma.sellers.findUnique({
      where: {
        seller_id: Number(sellerId),
      },
      select: {
        line1: true,
        line2: true,
        // city: true,
        district: true,
      },
    });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    return res.status(200).json({ data: seller });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function placeOrder(req: Request, res: Response) {
  const {
    buyerId,
    products,
    usedRewardPoints,
    deliveryInstructions,
    deliverycontactNo,
    isPickup,
  } = req.body;

  try {
    if (!buyerId || !products || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Inputs not found or products are empty" });
    }

    let totalAmount = 0;
    const orderProductsData = await Promise.all(
      products.map(async (product: any) => {
        const productDetails = await prisma.product.findUnique({
          where: {
            product_id: product.product_id,
          },
          include: {
            seller: true,
          },
        });

        if (!productDetails) {
          throw new Error(`Product with ID ${product.product_id} not found`);
        }

        const amount = productDetails.price * product.quantity;
        totalAmount += amount;

        return {
          productId: product.product_id,
          name: productDetails.name,
          quantity: product.quantity,
          amount: amount,
          seller: productDetails.seller,
        };
      })
    );

    const rewardPoints = Math.floor(totalAmount * 0.02);

    const order = await prisma.orders.create({
      data: {
        buyerId: Number(buyerId),
        totalAmount: totalAmount + 300 - usedRewardPoints,
        rewardPoints,
        usedrewardPoints: usedRewardPoints,
        deliveryAddress: isPickup
          ? "Pickup from store"
          : products[0].deliveryAddress,
        deliveryInstructions,
      },
      select: {
        id: true,
      },
    });

    const existingOrderId = order.id;

    const orderPromises = orderProductsData.map(async (productData: any) => {
      return prisma.orderProduct.create({
        data: {
          orderId: existingOrderId,
          productId: productData.productId,
          quantity: productData.quantity,
          amount: productData.amount,
        },
      });
    });

    await Promise.all(orderPromises);

    const wallet = await prisma.wallet.update({
      where: {
        buyerId: Number(buyerId),
      },
      data: {
        pointBalance: {
          increment: rewardPoints - usedRewardPoints,
        },
      },
    });

    const buyer = await prisma.buyers.findUnique({
      where: { buyer_id: Number(buyerId) },
      select: { email: true },
    });
    
    console.log(process.env)

    if (buyer && buyer.email) {
      const orderItemsHtml = orderProductsData
        .map(
          (productData: any) => `
            <tr>
              <td rowspan="2"><img src="image1.jpg" width="50" height="50" /></td>
              <td style="padding-right: 20px;">${productData.name}</td>
              <td style="padding-left: 20px;">Rs.${productData.amount}</td>
            </tr>
            <tr>
              <td colspan="2";">Qty: ${productData.quantity}</td>
            </tr>
          `
        )
        .join("");

      const addressLabel = isPickup ? "Pickup Address" : "Shipping Address";
      const deliveryAddress = isPickup
        ? `${orderProductsData[0].seller.line1}, ${orderProductsData[0].seller.line2}, ${orderProductsData[0].seller.city}, ${orderProductsData[0].seller.district}`
        : products[0].deliveryAddress;

      const htmlContent = `
        <html>
          <body>
            <h1>Order #${existingOrderId} Confirmed!</h1>
            <p>Thank you for your purchase! We've received your order.</p>
            <h3 style="margin-bottom: 0;">Order Summary</h3>
            <hr style="width: 50%; margin-left: 0;" />
            <table border="0" cellspacing="0" cellpadding="5">
              <tbody>
                ${orderItemsHtml}
              </tbody>
            </table>
            <hr style="width: 50%; margin-left: 0;" />

            <table border="0" cellspacing="2" cellpadding="5">
              <tbody>
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td>Rs.${totalAmount}</td>
                </tr>
                <tr>
                  <td><strong>Shipping Cost:</strong></td>
                  <td>Rs.300</td>
                </tr>
                <tr>
                  <td><strong>Reward Points Discount:</strong></td>
                  <td>-Rs.${usedRewardPoints}</td>
                </tr>
                <tr>
                  <td style="font-size: 20px;"><strong>Total:</strong></td>
                  <td style="font-size: 20px;">Rs.${
                    totalAmount + 300 - usedRewardPoints
                  }</td>
                </tr>
              </tbody>
            </table>
            <hr style="width: 50%; margin-left: 0;" />

            <p>
              <strong>${addressLabel}:</strong> ${deliveryAddress}
            </p>
            <p>Thank you for shopping with us!</p>
            <p>Best regards,</p>
            <p>Agri Market</p>
          </body>
        </html>
      `;

      try {
        console.log(buyer.email);
        await sendConfirmationEmail(buyer.email, "Order Confirmation", htmlContent);
      } catch (error) {
        console.error("Failed to send order confirmation email:", error);
      }
    }

    return res.status(200).json({
      message: "Order placed successfully",
      data: order,
      walletBalance: wallet.pointBalance,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return res.status(500).json({ error: "Failed to place order" });
  } finally {
    await prisma.$disconnect();
  }
}