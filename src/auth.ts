import axios from "axios";
import HIPAY from "./";

const TOKEN = async (
  host: "prod" | "staging",
  body: {
    token: string;
    entityId: string;
  }
): Promise<{
  success: boolean;
  message: string;
}> => {
  HIPAY.host = HIPAY.hosts[host];
  try {
    HIPAY.token = body.token;
    HIPAY.entityId = body.entityId;
    return {
      success: true,
      message: "success",
    };
  } catch (error) {
    return {
      success: false,
      message: "error",
    };
  }
};
export default { TOKEN };
