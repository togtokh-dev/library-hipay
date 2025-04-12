import axios from "axios";
import HIPAY from ".";
import { jsonToQueryString } from ".";

type FormParams = {
  checkoutId: string;
  lang?: "mn" | "en";
  email?: string;
  phone?: string;
};

const FORM = async (params: FormParams): Promise<string> => {
  try {
    return `${HIPAY.host}/payment${jsonToQueryString(params)}`;
  } catch (error: any) {
    return "";
  }
};

export default { FORM };
