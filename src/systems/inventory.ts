import type { ItemStack } from "../types";

export class Inventory {
  private slots: Array<ItemStack | null>;

  constructor(size = 24) {
    this.slots = Array.from({ length: size }, () => null);
  }

  add(itemId: string, qty: number): void {
    if (qty <= 0) {
      return;
    }

    // Stack into existing entries first.
    for (const slot of this.slots) {
      if (slot && slot.itemId === itemId) {
        slot.qty += qty;
        return;
      }
    }

    // Then use first free slot.
    const freeIdx = this.slots.findIndex((slot) => slot === null);
    if (freeIdx === -1) {
      throw new Error("Inventory full.");
    }
    this.slots[freeIdx] = { itemId, qty };
  }

  remove(itemId: string, qty: number): void {
    if (qty <= 0) {
      return;
    }

    let remaining = qty;
    for (let i = 0; i < this.slots.length && remaining > 0; i += 1) {
      const slot = this.slots[i];
      if (!slot || slot.itemId !== itemId) {
        continue;
      }

      const taken = Math.min(slot.qty, remaining);
      slot.qty -= taken;
      remaining -= taken;
      if (slot.qty <= 0) {
        this.slots[i] = null;
      }
    }

    if (remaining > 0) {
      throw new Error(`Not enough '${itemId}' in inventory.`);
    }
  }

  splitStack(slot: number, qty: number): number {
    const src = this.slots[slot];
    if (!src || qty <= 0 || qty >= src.qty) {
      throw new Error("Invalid split request.");
    }

    const freeIdx = this.slots.findIndex((entry) => entry === null);
    if (freeIdx === -1) {
      throw new Error("Inventory full.");
    }

    src.qty -= qty;
    this.slots[freeIdx] = { itemId: src.itemId, qty };
    return freeIdx;
  }

  mergeStack(fromSlot: number, toSlot: number): void {
    const from = this.slots[fromSlot];
    const to = this.slots[toSlot];
    if (!from || !to || from.itemId !== to.itemId) {
      throw new Error("Only equal item stacks can be merged.");
    }
    to.qty += from.qty;
    this.slots[fromSlot] = null;
  }

  move(fromSlot: number, toSlot: number): void {
    if (fromSlot === toSlot) {
      return;
    }
    const from = this.slots[fromSlot];
    this.slots[fromSlot] = this.slots[toSlot];
    this.slots[toSlot] = from;
  }

  getSlots(): Array<ItemStack | null> {
    return this.slots.map((slot) => (slot ? { ...slot } : null));
  }
}
