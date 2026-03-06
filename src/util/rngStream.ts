export interface RngStreamOptions {
  seed: number;
  algo: "pcg32";
}

export class RngStream {
  private seed: number;
  private algo: "pcg32";

  constructor(options: RngStreamOptions) {
    this.seed = options.seed;
    this.algo = options.algo;
  }

  exportState(): string {
    return JSON.stringify({ seed: this.seed, algo: this.algo });
  }

  static importState(state: string): RngStream {
    const parsed = JSON.parse(state);
    return new RngStream({ seed: parsed.seed, algo: parsed.algo });
  }
}
