import type { PopulateOption, SessionOption, ProjectionType } from "mongoose";
import mongodb from "mongodb";

type SelectExclude<DocType, K = keyof DocType> = K extends string
  ? `-${K}`
  : never;

type SelectInclude<DocType, K = keyof DocType> = K extends string
  ? `+${K}`
  : never;

type Select<DocType, K = keyof DocType> =
  | K
  | { [k in keyof DocType]?: 1 | 0 }
  | SelectExclude<DocType>
  | SelectInclude<DocType>
  | Array<K | SelectExclude<DocType> | SelectInclude<DocType>>;

/**
 * why retype this? because of the stupid '[key: string]: any' it has on the
 * default QueryOptions
 */
export interface QueryOptions<DocType, Lean extends boolean>
  extends PopulateOption,
    SessionOption {
  arrayFilters?: { [key: string]: any }[];
  batchSize?: number;
  collation?: mongodb.CollationOptions;
  comment?: any;
  context?: string;
  explain?: mongodb.ExplainVerbosityLike;
  fields?: any | string;
  hint?: mongodb.Hint;
  lean?: Lean;
  /**
   * If truthy, mongoose will return the document as a plain JavaScript object
   * rather than a mongoose document.
   */
  limit?: number;
  maxTimeMS?: number;
  maxscan?: number;
  multi?: boolean;
  multipleCastError?: boolean;
  /**
   * By default, `findOneAndUpdate()` returns the document as it was **before**
   * `update` was applied. If you set `new: true`, `findOneAndUpdate()` will
   * instead give you the object after `update` was applied.
   */
  new?: boolean;
  overwrite?: boolean;
  overwriteDiscriminatorKey?: boolean;
  projection?: ProjectionType<DocType>;
  /**
   * if true, returns the raw result from the MongoDB driver
   */
  rawResult?: boolean;
  readPreference?: string | mongodb.ReadPreferenceMode;
  /**
   * An alias for the `new` option. `returnOriginal: false` is equivalent to
   * `new: true`.
   */
  returnOriginal?: boolean;
  /**
   * Another alias for the `new` option. `returnOriginal` is deprecated so this
   * should be used.
   */
  returnDocument?: string;
  runValidators?: boolean;
  /* Set to `true` to automatically sanitize potentially unsafe user-generated query projections */
  sanitizeProjection?: boolean;
  /**
   * Set to `true` to automatically sanitize potentially unsafe query filters
   * by stripping out query selectors that aren't explicitly allowed using
   * `mongoose.trusted()`.
   */
  sanitizeFilter?: boolean;
  setDefaultsOnInsert?: boolean;
  skip?: number;
  snapshot?: any;
  sort?: { [k in keyof DocType]?: 1 | -1 };
  /** overwrites the schema's strict mode option */
  strict?: boolean | string;
  /**
   * equal to `strict` by default, may be `false`, `true`, or `'throw'`. Sets
   * the default
   * [strictQuery](https://mongoosejs.com/docs/guide.html#strictQuery) mode for
   * schemas.
   */
  strictQuery?: boolean | "throw";
  tailable?: number;
  upsert?: boolean;
  writeConcern?: mongodb.WriteConcern;
  select?: Select<DocType>;
  autopopulate?: boolean;
}
