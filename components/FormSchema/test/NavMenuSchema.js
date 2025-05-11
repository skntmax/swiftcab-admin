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

  "save-navbar": yup
    .boolean()
    .oneOf([true], "You must save the navbar"),
}).required();

export { navMenuSchema };
