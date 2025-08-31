'use client'
import * as yup from "yup";

const navMenuSchema = yup.object({
  nav_item: yup
    .string()
    .required("Navigation item is required"),

  sub_menu: yup
    .boolean()
    .required(),

  href: yup
    .string()
    .matches(/^\/([a-zA-Z0-9-]+\/?)+$/, "Href must start with '/' and can only contain alphanumeric characters and hyphens, separated by '/'")
    .required("Href is required"),

  icon: yup
    .string()
    .required("Icon is required"),
}).required();


const subNavbmenuSchema = yup.object({
  sub_nav_item: yup
    .string()
    .required("Sub navigation item is required"),

  sub_menu: yup
    .boolean()
    .required("Sub menu selection is required"),

  href: yup
    .string()
    .matches(
      /^\/([a-zA-Z0-9-]+\/?)+$/,
      "Href must start with '/' and can only contain alphanumeric characters and hyphens, separated by '/'"
    )
    .required("Href is required"),

    extra_paths :yup
    .string()
    .nullable(),
     
  icon: yup
    .string()
    .required("Icon is required"),

  nav_item_id: yup
    .number()
    .typeError("Nav Item ID must be a number")
    .required("Nav Item ID is required"),
}).required();



const assigningRoleMenuSchema = yup.object({
  role: yup
    .number()
    .required("Role is required"),

  nav_menu: yup
    .number()
    .typeError("Nav Item ID must be a number")
    .required("Nav Item ID is required"),
}).required();

export { navMenuSchema ,subNavbmenuSchema ,assigningRoleMenuSchema };
