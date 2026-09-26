import * as yup from "yup";

export const driverAssignmentSchema = yup.object({
  self: yup.boolean().required(),

  owner: yup
    .string()
    .nullable()
    .required("Owner is required"),

  driver: yup
    .mixed()
    .nullable()
    .when("self", {
      is: false,
      then: (schema) => schema.required("Driver is required when not assigning the owner as driver"),
      otherwise: (schema) => schema.nullable(),
    }),

  vhicle: yup
    .number()
    .transform((value, original) => (original === "" || original == null ? null : Number(original)))
    .nullable()
    .required("Vehicle is required"),
});
