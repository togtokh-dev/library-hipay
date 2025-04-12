import HIPAY from "../src/index";
import { main } from "../src/index";

async function runTests() {
  try {
    // STEP 1: Authenticate and set token + entityId
    await HIPAY.auth.TOKEN("staging", {
      entityId: "sellerte",
      token: "FQ5ByAS79LwoVtDT3UyDPp",
    });

    // STEP 2: Create a new checkout
    const createRes = await main.CREATE({
      redirect_uri: "https://example.com/redirect",
      webhook_url: "https://example.com/webhook",
      amount: 1000.1,
      qrData: false,
      items: [
        {
          itemno: "item001",
          name: "Test Product",
          price: 1000.1,
          quantity: 1,
          brand: "TestBrand",
          measure: "pcs",
          vat: 100,
          citytax: 50,
        },
      ],
    });

    if (!createRes.success || !createRes.data) {
      console.error("❌ CREATE failed:", createRes.message);
      return;
    }

    console.log("✅ CREATE result:", createRes.data);

    const { checkoutId } = createRes.data;

    // STEP 3: Check the checkout status
    const statusRes = await main.CHECKOUT_STATUS(checkoutId);

    if (!statusRes.success || !statusRes.data) {
      console.error("❌ CHECKOUT_STATUS failed:", statusRes.message);
    } else {
      console.log("✅ CHECKOUT_STATUS:", statusRes.data);
    }

    // Optional Delay (if testing real-time payment status)
    // await new Promise((res) => setTimeout(res, 2000));

    // STEP 4: Cancel the checkout (if needed)
    const cancelRes = await main.CANCEL_CHECKOUT(checkoutId);

    if (!cancelRes.success) {
      console.error("❌ CANCEL_CHECKOUT failed:", cancelRes.message);
    } else {
      console.log("✅ CANCEL_CHECKOUT:", cancelRes.message);
    }

    // STEP 5: Refund (only works after paid)
    const fakePaidPaymentId = "YOUR_REAL_PAID_PAYMENT_ID"; // replace with real one
    const refundRes = await main.REFUND_PAYMENT(fakePaidPaymentId);

    if (!refundRes.success || !refundRes.data) {
      console.error("❌ REFUND_PAYMENT failed:", refundRes.message);
    } else {
      console.log("✅ REFUND_PAYMENT:", refundRes.data);
    }
  } catch (error) {
    console.error("🔥 Unexpected error:", error);
  }
}

runTests();
