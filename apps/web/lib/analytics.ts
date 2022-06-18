import splitbee from "@splitbee/web";

class Analytics {
  private _enabled: boolean;

  constructor() {
    this._enabled = false;
  }

  enable() {
    if (window.location.origin === "https://uhhhh.xyz") {
      splitbee.init();
      splitbee.enableCookie();

      this._enabled = true;
    }
  }

  disable() {
    splitbee.reset();
  }

  track(...args: Parameters<typeof splitbee.track>) {
    if (!this._enabled) return;

    splitbee.track(...args);
  }

  identify(...args: Parameters<typeof splitbee.user.set>) {
    if (!this._enabled) return;

    splitbee.user.set(...args);
  }
}

export const analytics = new Analytics();
