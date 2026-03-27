<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cart | CampusCrave</title>
  <meta name="description" content="Review your cart, apply coupons, and place your food order.">
  <link rel="stylesheet" href="assets/styles.css">
</head>
<body>
  <div class="bg-glow bg-glow-one"></div>
  <div class="bg-glow bg-glow-two"></div>

  <?php include __DIR__ . '/includes/header.php'; ?>

  <div class="page">
    <div class="section-title">
      <h1>Your Cart</h1>
      <p>Review and place your order</p>
    </div>

    <div id="orderSuccessPanel" class="hidden"></div>

    <div class="layout layout-split">
      <main>
        <div id="cartItems" class="cart-items"></div>

        <div class="coupon-box" style="margin-top:18px;">
          <label for="couponInput">Coupon Code</label>
          <div class="coupon-row">
            <input id="couponInput" type="text" placeholder="SAVE10 or FREESHIP">
            <button id="applyCouponBtn" type="button">Apply</button>
          </div>
          <p id="couponMessage" class="coupon-message"></p>
        </div>
      </main>

      <aside class="cart">
        <h2>Order Summary</h2>
        <p class="cart-subtitle">Your bill breakdown</p>

        <div class="totals">
          <p><span>Subtotal</span><strong id="subtotalValue">INR 0</strong></p>
          <p><span>Packaging</span><strong id="packagingValue">INR 0</strong></p>
          <p><span>Delivery</span><strong id="deliveryValue">INR 0</strong></p>
          <p><span>Tax (5%)</span><strong id="taxValue">INR 0</strong></p>
          <p class="discount-line"><span>Discount</span><strong id="discountValue">- INR 0</strong></p>
          <p class="grand"><span>Total</span><strong id="totalValue">INR 0</strong></p>
        </div>

        <form id="checkoutForm" class="checkout-form">
          <h3>Checkout</h3>
          <label for="customerName">Name</label>
          <input id="customerName" type="text" placeholder="Your full name" required>

          <label for="deliveryAddress">Address / Hostel</label>
          <input id="deliveryAddress" type="text" placeholder="Hostel B, Room 213" required>

          <label for="customerPhone">Phone</label>
          <input id="customerPhone" type="tel" placeholder="10-digit number" required>

          <label for="paymentMode">Payment</label>
          <select id="paymentMode">
            <option>Cash on Delivery</option>
            <option>UPI</option>
            <option>Card</option>
          </select>

          <button id="placeOrderBtn" type="submit">Place Order</button>
        </form>

        <p id="checkoutMessage" class="coupon-message" style="margin-top:8px;"></p>
      </aside>
    </div>

    <div style="margin-top:20px; text-align:center;">
      <a href="menu.php" class="admin-link" style="background:var(--brand);">← Back to Menu</a>
    </div>
  </div>

  <script src="assets/shared.js"></script>
  <script src="assets/cart.js"></script>
</body>
</html>
