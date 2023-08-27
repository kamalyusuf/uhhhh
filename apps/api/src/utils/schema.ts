import { ErrorProps, JoiValidationError } from "@kamalyb/errors";
import Joi, { type SchemaMap, type ValidationOptions } from "joi";
import { v } from "./validation";

export type S = typeof s;

const options: ValidationOptions = {
  allowUnknown: false,
  presence: "required",
  abortEarly: false,
  errors: {
    wrap: {
      label: false
    }
  },
  messages: {
    "any.invalid": "invalid {#label}"
  }
};

const string = () => Joi.string().required().trim();

const number = () => Joi.number().required();

const boolean = () => Joi.boolean().required();

const date = () => Joi.date().required();

const object = <T>(map: SchemaMap<T, true>) => Joi.object<T, true>(map);

const anyobject = () => Joi.object();

const validate = (schema: Joi.Schema, value: any, o?: ValidationOptions) =>
  schema.validate(value, { ...options, ...(o ?? {}) });

const validateasync = (schema: Joi.Schema, value: any, o?: ValidationOptions) =>
  schema.validateAsync(value, { ...options, ...(o ?? {}) });

const isodate: Joi.CustomValidator = (value: string, helpers) => {
  if (!v.isisodate(value)) return helpers.error("any.invalid");

  return value;
};

const parse = <T>(result: Joi.ValidationResult<T>) => {
  if (!result.error) return { value: result.value };

  const errors: ErrorProps[] = [];

  for (const e of new JoiValidationError(result.error.details).serialize())
    errors.push(e);

  return { errors };
};

const custom = {
  isodate
};

export const s = {
  options,
  string,
  number,
  boolean,
  date,
  object,
  validate,
  validateasync,
  custom,
  parse,
  anyobject
};
