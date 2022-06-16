import { EventError } from "types";

type T =
  | string
  | EventError["errors"]
  | Array<EventError["errors"][number] | string>
  | EventError["errors"][number];

export class SocketEventError implements EventError {
  event?: EventError["event"];

  errors: EventError["errors"];

  constructor(message: string, event?: EventError["event"]);
  constructor(props: EventError["errors"], event?: EventError["event"]);
  constructor(props: EventError["errors"][number], event?: EventError["event"]);
  constructor(
    props: Array<EventError["errors"][number] | string>,
    event?: EventError["event"]
  );
  constructor(param: T, event?: EventError["event"]) {
    this.errors = this.parse(param);

    this.event = event;
  }

  parse(param: T): EventError["errors"] {
    if (typeof param === "string") return [{ message: param }];

    if (Array.isArray(param)) {
      return param.map((p) => {
        if (typeof p === "string") return { message: p };

        return {
          message: p.message,
          path: p.path
        };
      });
    }

    return [param];
  }
}
