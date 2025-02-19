import { v2 as cloudinary } from "cloudinary";

import { config } from "dotenv";
import { cloudnairy_api_key, cloudnairy_api_secrate, cloudnairy_cloud_name } from "../constant/constant.js";

config();

cloudinary.config({
  cloud_name: cloudnairy_cloud_name,
  api_key: cloudnairy_api_key,
  api_secret:cloudnairy_api_secrate,
});

export default cloudinary;