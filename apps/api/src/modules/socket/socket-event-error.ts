import type { EventError } from "types";

export class SocketEventError implements EventError {
  event: EventError["event"];

  errors: EventError["errors"];

  constructor(
    event: EventError["event"],
    param: EventError["errors"][number] | Array<EventError["errors"][number]>
  ) {
    this.errors = this.parse(param);

    this.event = event;
  }

  private parse(
    param: EventError["errors"][number] | Array<EventError["errors"][number]>
  ): EventError["errors"] {
    return Array.isArray(param) ? param.map((p) => p) : [param];
  }
}
