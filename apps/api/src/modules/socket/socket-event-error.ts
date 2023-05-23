import type { EventError } from "types";

export class SocketEventError implements EventError {
  event: EventError["event"];

  errors: EventError["errors"];

  constructor(
    param: string | EventError["errors"] | EventError["errors"][number],
    event: EventError["event"]
  ) {
    this.errors = this.parse(param);

    this.event = event;
  }

  private parse(
    param: string | EventError["errors"] | EventError["errors"][number]
  ): EventError["errors"] {
    if (typeof param === "string") return [{ message: param }];

    if (Array.isArray(param))
      return param.map((p) => {
        if (typeof p === "string") return { message: p };

        return {
          message: p.message,
          path: p.path
        };
      });

    return [param];
  }
}
