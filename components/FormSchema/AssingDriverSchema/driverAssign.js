import * as yup from "yup";

export const driverAssignmentSchema = yup.object({
  self: yup.boolean().required(),

  owner: yup
    .string()
    .nullable()
    .when("self", {
      is: false,
      then: (schema) => schema.required("Owner is required when self is false"),
      otherwise: (schema) => schema.nullable(),
    }),

  driver: yup
    .string()
    .nullable()
    .when("self", {
      is: false,
      then: (schema) => schema.required("Driver is required when self is false"),
      otherwise: (schema) => schema.nullable(),
    }),

  vhicle: yup
    .string()
    .nullable()
    .when("self", {
      is: false,
      then: (schema) => schema.required("Vehicle is required when self is false"),
      otherwise: (schema) => schema.nullable(),
    }),
});
