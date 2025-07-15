declare module "cors" {
  import { RequestHandler } from "express";

  interface CorsOptions {
    origin?: string | string[] | boolean;
    credentials?: boolean;
  }

  function cors(options?: CorsOptions): RequestHandler;
  export = cors;
}
