import axiosMaster from "axios-master";
import { AxiosResponse } from "axios";
import HIPAY from ".";

type checkoutT = {
  entityId?: string;
  redirect_uri: string;
  webhook_url: string;
  amount: number;
  currency?: "MNT" | "USD";
  qrData?: boolean;
  items: {
    itemno: string;
    name: string;
    price: number;
    quantity: number;
    brand: string;
    measure: string;
    vat: number;
    citytax: number;
  }[];
};

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
    const payload = {
      entityId: HIPAY.entityId || body.entityId,
      redirect_uri: body.redirect_uri,
      webhook_url: body.webhook_url,
      amount: body.amount,
      qrData: body.qrData || false,
      items: body.items,
    };

    const resData = await axiosMaster(
      {
        method: "post",
        maxBodyLength: Infinity,
        url: `${HIPAY.host}/checkout`,
        headers: {
          Authorization: `Bearer ${HIPAY.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: payload,
      },
      {
        name: "HIPAY CREATE",
        logger(data) {
          if (HIPAY.logger) console.log(data.json);
        },
      },
    );

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
      return {
        success: false,
        message: resData.message || resData.description || "Unknown failure",
      };
    }
  } catch (error) {
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
    const resData = await axiosMaster(
      {
        method: "get",
        url: `${HIPAY.host}/checkout/api/checkoutid/${checkoutId}`,
        headers: {
          Authorization: `Bearer ${HIPAY.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        params: {
          entityId: HIPAY.entityId,
        },
      },
      {
        name: "HIPAY STATUS",
        logger(data) {
          if (HIPAY.logger) console.log(data.json);
        },
      },
    );

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
    const resData = await axiosMaster(
      {
        method: "post",
        url: `${HIPAY.host}/checkout/cancel`,
        headers: {
          Authorization: `Bearer ${HIPAY.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          checkoutId,
        },
      },
      {
        name: "HIPAY CANCEL",
        logger(data) {
          if (HIPAY.logger) console.log(data.json);
        },
      },
    );

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
    const resData = await axiosMaster(
      {
        method: "post",
        url: `${HIPAY.host}/payment/cancel`,
        headers: {
          Authorization: `Bearer ${HIPAY.token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          entityId: HIPAY.entityId,
          paymentId,
        },
      },
      {
        name: "HIPAY REFUND",
        logger(data) {
          if (HIPAY.logger) console.log(data.json);
        },
      },
    );

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

export default {
  CREATE,
  CHECKOUT_STATUS,
  CANCEL_CHECKOUT,
  REFUND_PAYMENT,
};
