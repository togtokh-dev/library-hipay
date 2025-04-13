import axiosMaster from "axios-master";
import HIPAY from ".";
import { jsonToQueryString } from ".";

type GetUserTokenParams = {
  client_id: string;
  client_secret: string;
  code: string;
  grant_type?: "authorization_code";
};

type GetUserTokenResponse = {
  success: boolean;
  message: string;
  data?: {
    access_token: string;
    expires: string;
  };
};

const getToken = async (
  params: GetUserTokenParams,
): Promise<GetUserTokenResponse> => {
  try {
    const resData = await axiosMaster(
      {
        method: "post",
        url: `${HIPAY.host}/user/token`,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        data: {
          client_id: params.client_id,
          client_secret: params.client_secret,
          code: params.code,
          grant_type: params.grant_type || "authorization_code",
        },
      },
      {
        name: "HIPAY USER TOKEN",
        logger(data) {
          if (HIPAY.logger) console.log(data.json);
        },
      },
    );

    if (resData.code === 1) {
      return {
        success: true,
        message: resData.description || "Token retrieved successfully",
        data: {
          access_token: resData.access_token,
          expires: resData.expires,
        },
      };
    } else {
      return {
        success: false,
        message: resData.message || resData.description || "Unknown error",
      };
    }
  } catch (error: any) {
    console.error("getToken error:", error?.response?.data || error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.description ||
        "Failed to get user token",
    };
  }
};

type UserInfoResponse = {
  success: boolean;
  message: string;
  data?: {
    firstname: string;
    lastname: string;
    phone: string;
    email: string;
    customerId: string;
  };
};

const getUserInfo = async (accessToken: string): Promise<UserInfoResponse> => {
  try {
    const resData = await axiosMaster(
      {
        method: "get",
        url: `${HIPAY.host}/user/info`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      },
      {
        name: "HIPAY USER INFO",
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
          firstname: resData.firstname,
          lastname: resData.lastname,
          phone: resData.phone,
          email: resData.email,
          customerId: resData.customerId,
        },
      };
    } else {
      return {
        success: false,
        message: resData.message || resData.description || "Unknown failure",
      };
    }
  } catch (error: any) {
    console.error("getUserInfo error:", error?.response?.data || error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        error?.response?.data?.description ||
        "Failed to fetch user info",
    };
  }
};

export default { getToken, getUserInfo };
