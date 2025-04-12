import auth from "./auth";
import main from "./main";
import eCommerce from "./e-commerce";
import miniApp from "./mini-app";
export const jsonToQueryString = (params: { [key: string]: any }) => {
  const query = Object.keys(params)
    .map(
      (key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`,
    )
    .join("&");
  return query ? `?${query}` : "";
};
let entityId = "";
let token = "";
let host = "";
let hosts = {
  staging: "https://test.hipay.mn",
  prod: "https://sts.hipay.mn",
};
export default { token, entityId, hosts, host, auth, main, eCommerce, miniApp };

export { default as main } from "./main";
export { default as eCommerce } from "./e-commerce";
export { default as miniApp } from "./mini-app";
