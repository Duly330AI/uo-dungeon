export interface RngStreamOptions {
  seed: number;
  algo: "pcg32";
}

<<<<<<< HEAD
interface RngState {
  seed: number;
  algo: "pcg32";
}

=======
>>>>>>> aca68e3a7c0535868b373a35052e5025584c7d1f
export class RngStream {
  private seed: number;
  private algo: "pcg32";

  constructor(options: RngStreamOptions) {
<<<<<<< HEAD
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

=======
    this.seed = options.seed;
    this.algo = options.algo;
  }

>>>>>>> aca68e3a7c0535868b373a35052e5025584c7d1f
  exportState(): string {
    return JSON.stringify({ seed: this.seed, algo: this.algo });
  }

  static importState(state: string): RngStream {
<<<<<<< HEAD
    const parsed = JSON.parse(state) as Partial<RngState>;
    if (typeof parsed.seed !== "number" || parsed.algo !== "pcg32") {
      throw new Error("Invalid RNG state payload.");
    }
=======
    const parsed = JSON.parse(state);
>>>>>>> aca68e3a7c0535868b373a35052e5025584c7d1f
    return new RngStream({ seed: parsed.seed, algo: parsed.algo });
  }
}
