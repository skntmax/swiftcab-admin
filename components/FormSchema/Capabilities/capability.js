'use client'
import * as yup from "yup";

const capabilitySchema =  yup.object().shape({
   capability_name: yup
    .string()
    .required("Capability name is required")
    .min(2, "Must be at least 2 characters"),

  capability_identifier: yup
    .string()
    .required("Capability identifier is required")
    .matches(/^[a-z0-9-]+-cap$/, "Identifier must end with '-cap' (e.g., 'admin-capability-cap')"),

  role_id: yup
    .number()
    .typeError("Role is required")
    .required("Role is required"),
});


const assignPermissionsToCapSchema = yup.object().shape({
  capabilityId: yup
    .number()
    .required("Capability is required")
    .typeError("Capability is required"),
  permissionId: yup
    .array()
    .of(yup.number().required())
    .min(1, "At least one permission must be selected")
    .required("Permission is required"),
});

export { capabilitySchema , assignPermissionsToCapSchema };
