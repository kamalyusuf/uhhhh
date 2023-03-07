import mongoose, {
  type SchemaOptions,
  type SchemaDefinition,
  type SchemaDefinitionType,
  Schema,
  type Model as MongooseModel,
  type HydratedDocument
} from "mongoose";
import uniquevalidator from "mongoose-unique-validator";
import type { MongooseSchemaProps, Timestamp } from "../../types/types";

export class ModelBuilder<
  Props extends Timestamp & { _id: mongoose.Types.ObjectId },
  Methods extends {} = {},
  Virtuals extends {} = {},
  Statics extends {} = {}
> {
  private _schema?: Schema<
    Props,
    MongooseModel<Props, {}, Methods, Virtuals>,
    Methods,
    {},
    Virtuals,
    Statics
  >;

  private _model?: MongooseModel<Props, {}, Methods, Virtuals> & Statics;

  constructor(public name: string, public collection: string) {}

  schema(
    definition: (
      t: typeof Schema.Types
    ) => Required<
      SchemaDefinition<SchemaDefinitionType<MongooseSchemaProps<Props>>>
    >,
    options: Omit<
      SchemaOptions<Props, Methods, {}, Statics, Virtuals>,
      "toObject" | "toJSON" | "collection"
    > & {
      to_json_exclude?: Array<keyof Props | keyof Virtuals>;
      to_json_fields?: Array<keyof Props | keyof Virtuals>;
    } = {}
  ) {
    const schemaoptions: SchemaOptions<Props, Methods, {}, Statics, Virtuals> =
      {
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
          transform(
            _: HydratedDocument<Props, Methods, Virtuals>,
            ret: HydratedDocument<Props, Methods, Virtuals>
          ) {
            if (options.to_json_fields?.length)
              return Object.keys(ret).forEach((key) => {
                const k = key as keyof Props | keyof Virtuals;

                // @ts-ignore
                if (!options.to_json_fields.includes(k) && ret[key])
                  // @ts-ignore
                  delete ret[key];
              });

            if (options.to_json_exclude?.length)
              // @ts-ignore
              for (const field of options.to_json_exclude) {
                // @ts-ignore
                if (ret[field]) delete ret[field];
              }
          }
        }
      };

    // @ts-ignore
    this._schema = new Schema(definition(Schema.Types), schemaoptions);

    if (!this._schema) throw new Error("schema not defined");

    this._schema.plugin(uniquevalidator, {
      message: "{PATH} already exists"
    });

    return this._schema as Schema<
      Props,
      MongooseModel<Props, {}, Methods, Virtuals>,
      Methods,
      {},
      Virtuals,
      Statics
    >;
  }

  model() {
    if (!this._schema)
      throw new Error(`${this.name} cannot call model before defining schema`);

    if (this._model) throw new Error(`[${this.name}] already modelled`);

    this._model =
      (mongoose.models[this.name] as unknown as MongooseModel<
        Props,
        {},
        Methods,
        Virtuals
      > &
        Statics) || mongoose.model(this.name, this._schema, this.collection);

    return this._model;
  }
}
