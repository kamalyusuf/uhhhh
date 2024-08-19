import joi from "joi";
import type { Schema, SchemaMap, ValidationOptions } from "joi";

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

const string = () => joi.string().required().trim();

const number = () => joi.number().required();

const boolean = () => joi.boolean().required();

const date = () => joi.date().required();

const object = <T>(map: SchemaMap<T, true>) => joi.object<T, true>(map);

const anyobject = () => joi.object();

const validate = <T>(schema: Schema<T>, value: any) =>
  schema.validate(value, options);

const validateasync = <T>(schema: Schema<T>, value: any) =>
  schema.validateAsync(value, options);

export const s = {
  options,
  string,
  number,
  boolean,
  date,
  object,
  anyobject,
  validate,
  validateasync
} as const;
