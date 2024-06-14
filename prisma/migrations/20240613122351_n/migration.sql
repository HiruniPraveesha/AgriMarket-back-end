-- CreateTable
CREATE TABLE "buyers" (
    "buyer_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "line1" TEXT,
    "line2" TEXT,
    "city" TEXT,
    "contactNo" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "buyerAddress" (
    "buyerId" INTEGER NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" INTEGER NOT NULL,

    CONSTRAINT "buyerAddress_pkey" PRIMARY KEY ("buyerId","line1","line2","city")
);

-- CreateTable
CREATE TABLE "passwordResetTokens" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passwordResetTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "seller_id" SERIAL NOT NULL,
    "store_name" TEXT,
    "email" TEXT NOT NULL,
    "line1" TEXT,
    "line2" TEXT,
    "city" TEXT,
    "district" TEXT,
    "contactNo" TEXT,
    "password" TEXT,
    "OTP" TEXT,
    "emailVerified" BOOLEAN
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "cart" (
    "buyerId" INTEGER NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("buyerId")
);

-- CreateTable
CREATE TABLE "cartProduct" (
    "buyerId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "cartProduct_pkey" PRIMARY KEY ("buyerId","productId")
);

-- CreateTable
CREATE TABLE "wallet" (
    "wallet_id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "walletBal" DOUBLE PRECISION NOT NULL,
    "ReachargeAmt" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "wallet_pkey" PRIMARY KEY ("wallet_id")
);

-- CreateTable
CREATE TABLE "admin" (
    "admin_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "orders" (
    "order_id" SERIAL NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "payment_id" SERIAL NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "Amount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "calendarEvents" (
    "event_id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "sellerId" INTEGER NOT NULL,

    CONSTRAINT "calendarEvents_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "N_id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "Status" TEXT NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "productid" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("N_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyers_buyer_id_key" ON "buyers"("buyer_id");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_email_key" ON "buyers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "buyers_contactNo_key" ON "buyers"("contactNo");

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetTokens_id_key" ON "passwordResetTokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_seller_id_key" ON "sellers"("seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_email_key" ON "sellers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_contactNo_key" ON "sellers"("contactNo");

-- CreateIndex
CREATE UNIQUE INDEX "wallet_wallet_id_key" ON "wallet"("wallet_id");

-- AddForeignKey
ALTER TABLE "buyerAddress" ADD CONSTRAINT "buyerAddress_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("buyer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "product_category" FOREIGN KEY ("categoryId") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "product_seller" FOREIGN KEY ("sellerId") REFERENCES "sellers"("seller_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("buyer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartProduct" ADD CONSTRAINT "cartProduct_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "cart"("buyerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartProduct" ADD CONSTRAINT "cartProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet" ADD CONSTRAINT "wallet_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "buyers"("buyer_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "puchased_order" FOREIGN KEY ("sellerId") REFERENCES "sellers"("seller_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendarEvents" ADD CONSTRAINT "calendar" FOREIGN KEY ("sellerId") REFERENCES "sellers"("seller_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_about" FOREIGN KEY ("productid") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notification_from" FOREIGN KEY ("sellerId") REFERENCES "sellers"("seller_id") ON DELETE RESTRICT ON UPDATE CASCADE;
