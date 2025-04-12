import axios from "axios";
import { AxiosResponse } from "axios";
import HIPAY from ".";

// ✅ Type definition for checkout payload
type checkoutT = {
  entityId?: string; // Optional override of HIPAY.entityId
  redirect_uri: string; // URL where the user is redirected after payment
  webhook_url: string; // URL to receive asynchronous payment result
  amount: number; // Payment amount
  currency?: "MNT" | "USD"; // Optional currency
  qrData?: boolean; // If true, QR code is returned
  items: {
    itemno: string; // Item code (max 32 characters)
    name: string; // Item name (max 128 characters)
    price: number; // Price per unit
    quantity: number; // Quantity
    brand: string; // Brand name (max 32 characters)
    measure: string; // Measurement unit (e.g., pcs, kg)
    vat: number; // VAT amount
    citytax: number; // City tax amount
  }[];
};

// ✅ Main function to create a HIPAY checkout
const CREATE = async (
  body: checkoutT,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    expires: string;
    checkoutId: string;
    qrData?: string | null;
  };
}> => {
  try {
    // ✅ Payload to be sent to HIPAY API
    const payload = {
      entityId: HIPAY.entityId || body.entityId,
      redirect_uri: body.redirect_uri,
      webhook_url: body.webhook_url,
      amount: body.amount,
      qrData: body.qrData || false,
      items: body.items,
    };

    // ✅ API call to HIPAY /checkout endpoint
    const res = await axios.post(`${HIPAY.host}/checkout`, payload, {
      headers: {
        Authorization: `Bearer ${HIPAY.token}`, // Token from HIPAY merchant config
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const resData = res.data;

    // ✅ Success case: code === 1
    if (resData.code === 1) {
      return {
        success: true,
        message: resData.description || "success",
        data: {
          expires: resData.expires,
          checkoutId: resData.checkoutId,
          qrData: resData.qrData || null,
        },
      };
    } else {
      // ✅ Error case but response received
      return {
        success: false,
        message: resData.message || resData.description || "Unknown failure",
      };
    }
  } catch (error) {
    // ✅ Handle any unexpected network/API error
    const axiosError = error as AxiosResponse;
    console.error("Failed to fetch user info:", axiosError?.data?.data);
    return {
      success: false,
      message:
        axiosError?.data?.data?.message ||
        axiosError?.data?.data?.description ||
        "Checkout error",
    };
  }
};
const CHECKOUT_STATUS = async (
  checkoutId: string,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    status: string;
    description: string;
    amount: number;
    statusDate: string;
    paymentId: string;
  };
}> => {
  try {
    const res = await axios.get(
      `${HIPAY.host}/checkout/api/checkoutid/${checkoutId}`,
      {
        headers: {
          Authorization: `Bearer ${HIPAY.token}`, // Merchant token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        params: {
          entityId: HIPAY.entityId, // Merchant entity ID
        },
      },
    );

    const resData = res.data;

    if (resData.code === 1) {
      return {
        success: true,
        message: resData.description || "Checkout status success",
        data: {
          status: resData.status,
          description: resData.description,
          amount: resData.amount,
          statusDate: resData.status_date,
          paymentId: resData.payment_id,
        },
      };
    } else {
      return {
        success: false,
        message: resData.message || resData.description || "Unknown error",
      };
    }
  } catch (error) {
    const axiosError = error as AxiosResponse;
    console.error("Failed to get checkout status:", axiosError?.data);
    return {
      success: false,
      message:
        axiosError?.data?.message ||
        axiosError?.data?.description ||
        "Checkout status fetch failed",
    };
  }
};
const CANCEL_CHECKOUT = async (
  checkoutId: string,
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const res = await axios.post(
      `${HIPAY.host}/checkout/cancel`,
      {
        checkoutId, // ✅ Body: required field
      },
      {
        headers: {
          Authorization: `Bearer ${HIPAY.token}`, // ✅ Token
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const resData = res.data;

    if (resData.code === 1) {
      return {
        success: true,
        message: resData.description || "Checkout cancelled successfully",
      };
    } else {
      return {
        success: false,
        message: resData.message || resData.description || "Unknown error",
      };
    }
  } catch (error) {
    const axiosError = error as AxiosResponse;
    console.error("Failed to cancel checkout:", axiosError?.data);
    return {
      success: false,
      message:
        axiosError?.data?.message ||
        axiosError?.data?.description ||
        "Checkout cancel failed",
    };
  }
};
const REFUND_PAYMENT = async (
  paymentId: string,
): Promise<{
  success: boolean;
  message: string;
  data?: {
    correctionPaymentId: string;
    paymentId: string;
  };
}> => {
  try {
    const res = await axios.post(
      `${HIPAY.host}/payment/cancel`,
      {
        entityId: HIPAY.entityId, // 🏷️ Merchant registered client ID
        paymentId, // 🏷️ Transaction ID to refund
      },
      {
        headers: {
          Authorization: `Bearer ${HIPAY.token}`, // 🔐 Bearer token (client_secret)
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      },
    );

    const resData = res.data;

    if (resData.code === 1) {
      return {
        success: true,
        message: resData.description || "Payment refund success",
        data: {
          correctionPaymentId: resData.correction_paymentId,
          paymentId: resData.paymentId,
        },
      };
    } else {
      return {
        success: false,
        message: resData.message || resData.description || "Refund failed",
      };
    }
  } catch (error) {
    const axiosError = error as AxiosResponse;
    console.error("Refund request failed:", axiosError?.data);
    return {
      success: false,
      message:
        axiosError?.data?.message ||
        axiosError?.data?.description ||
        "Refund request error",
    };
  }
};

export default { CREATE, CHECKOUT_STATUS, CANCEL_CHECKOUT, REFUND_PAYMENT };
