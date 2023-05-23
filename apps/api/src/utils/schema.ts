import { ErrorProps, JoiValidationError } from "@kamalyb/errors";
import Joi, { type SchemaMap, type ValidationOptions } from "joi";
import { isisodate } from "./is";

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

const email = () => Joi.string().email().required();

const password = () => Joi.string().min(8).required();

const string = () => Joi.string().required().trim();

const number = () => Joi.number().required();

const boolean = () => Joi.boolean().required();

const date = () => Joi.date().required();

const object = <T>(map: SchemaMap<T, true>) => Joi.object<T, true>(map);

const anyobject = () => Joi.object();

const array = () => Joi.array().required();

const validate = (schema: Joi.Schema, value: any, o?: ValidationOptions) =>
  schema.validate(value, { ...options, ...(o ?? {}) });

const validateasync = (schema: Joi.Schema, value: any, o?: ValidationOptions) =>
  schema.validateAsync(value, { ...options, ...(o ?? {}) });

const isodate: Joi.CustomValidator = (value: string, helpers) => {
  if (!isisodate(value)) return helpers.error("any.invalid");

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
  email,
  password,
  string,
  number,
  boolean,
  date,
  object,
  array,
  validate,
  validateasync,
  custom,
  parse,
  anyobject
};
