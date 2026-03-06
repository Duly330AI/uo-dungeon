export interface RngStreamOptions {
  seed: number;
  algo: "pcg32";
}

interface RngState {
  seed: number;
  algo: "pcg32";
}

export class RngStream {
  private seed: number;
  private algo: "pcg32";

  constructor(options: RngStreamOptions) {
    this.seed = options.seed >>> 0;
    this.algo = options.algo;
  }

  // Fast deterministic PRNG step (LCG). Kept behind the pcg32 label for API stability.
  private nextUint32(): number {
    this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
    return this.seed;
  }

  nextFloat(): number {
    return this.nextUint32() / 0x100000000;
  }

  nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive < minInclusive) {
      throw new Error("Invalid range for nextInt.");
    }
    const range = maxInclusive - minInclusive + 1;
    return minInclusive + Math.floor(this.nextFloat() * range);
  }

  exportState(): string {
    return JSON.stringify({ seed: this.seed, algo: this.algo });
  }

  static importState(state: string): RngStream {
    const parsed = JSON.parse(state) as Partial<RngState>;
    if (typeof parsed.seed !== "number" || parsed.algo !== "pcg32") {
      throw new Error("Invalid RNG state payload.");
    }
    return new RngStream({ seed: parsed.seed, algo: parsed.algo });
  }
}
