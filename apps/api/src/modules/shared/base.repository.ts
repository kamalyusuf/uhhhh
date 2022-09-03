import mongoose, {
  type Model as MongooseModel,
  type HydratedDocument,
  type SaveOptions,
  type FilterQuery,
  type QueryOptions as DefaultQueryOptions
} from "mongoose";
import type { QueryOptions } from "../types";
import type { Id, MongooseSchemaProps, Timestamp } from "../../types/types";

export abstract class BaseRepository<
  Props extends Timestamp & { _id: mongoose.Types.ObjectId },
  Methods extends {},
  Virtuals extends {},
  Statics extends {},
  T = MongooseSchemaProps<Props>
> {
  constructor(
    protected readonly Model: MongooseModel<Props, {}, Methods, Virtuals> &
      Statics
  ) {}

  build(props: T): HydratedDocument<Props, Methods, Virtuals> {
    // @ts-ignore
    return new this.Model(props);
  }

  async create(props: T): Promise<HydratedDocument<Props, Methods, Virtuals>>;
  async create(
    props: T[],
    options?: SaveOptions
  ): Promise<HydratedDocument<Props, Methods, Virtuals>[]>;
  async create(
    props: T | T[],
    options?: SaveOptions
  ): Promise<
    | HydratedDocument<Props, Methods, Virtuals>
    | HydratedDocument<Props, Methods, Virtuals>[]
  > {
    // @ts-ignore
    return this.Model.create(props, options);
  }

  async findById<Lean extends boolean = false>(
    _id: Id,
    opts?: {
      options?: QueryOptions<Props, Lean>;
    }
  ): Promise<
    Lean extends true
      ? Props | null
      : HydratedDocument<Props, Methods, Virtuals> | null
  > {
    let query = this.Model.findById(_id);

    if (opts?.options)
      query = query.setOptions(opts.options as DefaultQueryOptions);

    return query;
  }

  async exists(filter: FilterQuery<Props>) {
    return this.Model.exists(filter);
  }

  async findOne<Lean extends boolean = false>(
    filter: FilterQuery<Props>,
    opts?: { options?: QueryOptions<Props, Lean> }
  ): Promise<
    Lean extends true
      ? Props | null
      : HydratedDocument<Props, Methods, Virtuals> | null
  > {
    let query = this.Model.findOne(filter);

    if (opts?.options)
      query = query.setOptions(opts.options as DefaultQueryOptions);

    return query;
  }

  async find<Lean extends boolean = false>(
    filter: FilterQuery<Props>,
    opts?: { options?: QueryOptions<Props, Lean> }
  ): Promise<
    Lean extends true ? Props[] : HydratedDocument<Props, Methods, Virtuals>[]
  > {
    let query = this.Model.find(filter);

    if (opts?.options)
      query = query.setOptions(opts.options as DefaultQueryOptions);

    return query;
  }
}
