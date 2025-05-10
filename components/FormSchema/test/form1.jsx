import * as yup from "yup";

const  form1Schema = yup.object({
    firstName: yup.string().required(),
    age: yup.number().positive().integer().required(),
  }).required();

  export {form1Schema}