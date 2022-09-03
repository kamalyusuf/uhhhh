import mongoose, {
  type SchemaOptions,
  type SchemaDefinition,
  type SchemaDefinitionType,
  Schema,
  type Model as MongooseModel,
  model
} from "mongoose";
import { type MongooseSchemaProps } from "../../types/types";

export class ModelBuilder<Props, Methods = {}, Statics = {}, Virtuals = {}> {
  readonly schema = (
    definition: Required<
      SchemaDefinition<SchemaDefinitionType<MongooseSchemaProps<Props>>>
    >,
    options: Omit<SchemaOptions, "toObject" | "toJSON" | "collection"> & {
      exclude?: Array<keyof Props | keyof Virtuals>;
      public?: Array<keyof Props | keyof Virtuals>;
    } = {}
  ): Schema<
    Props,
    MongooseModel<Props, {}, Methods, Virtuals>,
    Methods,
    {},
    Virtuals,
    Statics
  > => {
    const schemaOptions: SchemaOptions = {
      ...options,
      id: false,
      versionKey: false,
      timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
      },
      strict: "throw",
      toObject: {
        virtuals: true
      },
      toJSON: {
        virtuals: true,
        transform(_: any, ret: any) {
          if (options.public?.length) {
            const fields = options.public.filter(Boolean);

            if (!fields.length) return;

            Object.keys(ret).forEach((key) => {
              const k = key as keyof Props | keyof Virtuals;

              if (!fields.includes(k)) delete ret[key];
            });

            return;
          }

          if (options.exclude?.length) {
            const fields = options.exclude.filter(Boolean);

            if (!fields.length) return;

            for (const field of fields) delete ret[field];
          }
        }
      }
    };

    // @ts-ignore
    const schema = new Schema(definition, schemaOptions) as Schema<
      Props,
      MongooseModel<Props, {}, Methods, Virtuals>,
      Methods,
      {},
      Virtuals,
      Statics
    >;

    schema.plugin(require("mongoose-unique-validator"), {
      message: "expected {PATH} to be unique"
    });

    return schema;
  };

  readonly model = (
    name: string,
    schema: Schema<Props>,
    collection: string
  ): MongooseModel<
    Props,
    {},
    Methods,
    Virtuals,
    Schema<
      Props,
      MongooseModel<
        Props,
        {},
        Methods,
        Virtuals,
        Schema<
          Props,
          MongooseModel<Props, {}, Methods, Virtuals>,
          Methods,
          {},
          Virtuals,
          Statics
        >
      >,
      Methods,
      {},
      Virtuals,
      Statics
    >
  > &
    Statics =>
    (mongoose.models[name] as MongooseModel<
      Props,
      {},
      Methods,
      Virtuals,
      Schema<
        Props,
        MongooseModel<Props, {}, Methods, Virtuals>,
        Methods,
        {},
        Virtuals,
        Statics
      >
    > &
      Statics) || model(name, schema, collection);
}
