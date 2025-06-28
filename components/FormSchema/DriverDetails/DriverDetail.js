'use client'
import * as yup from "yup";

export const driverProfileSchema = yup.object({
  profile_pic: yup
    .mixed()
    .nullable()
    .required("Profile picture is required"),

  DL: yup
    .mixed()
    .nullable()
    .required("Driving License is required"),

  RC: yup
    .mixed()
    .nullable()
    .required("RC document is required"),

  insurance: yup
    .mixed()
    .nullable()
    .required("Insurance document is required"),

  pan_card: yup
    .mixed()
    .nullable()
    .required("PAN card is required"),

  adhar_card: yup
    .mixed()
    .nullable()
    .required("Aadhar card is required"),

  bank_account: yup
    .string()
    .trim()
    .required("Bank account number is required"),

  ifsc: yup
    .string()
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code")
    .required("IFSC code is required"),

  bank_account_branch: yup
    .string()
    .required("Bank branch is required"),
});
