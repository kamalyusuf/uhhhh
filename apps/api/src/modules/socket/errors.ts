export class NotInRoomError extends Error {
  constructor() {
    super("not in room");
  }
}

export class NoProducerFoundError extends Error {
  constructor() {
    super("producer not found");
  }
}

export class NoTransportFoundError extends Error {
  constructor() {
    super("transport not found");
  }
}

export class NoConsumerFoundError extends Error {
  constructor() {
    super("consumer not found");
  }
}
