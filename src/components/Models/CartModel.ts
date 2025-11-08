import { IProduct } from "../../types/index";
import { IEvents } from "../base/Events";

export class CartModel {
  private items: IProduct[] = [];
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(item: IProduct): void {
    if (!this.hasItem(item.id)) {
      this.items.push(item);
      this.events.emit("cart:changed");
    }
  }

  removeItem(item: IProduct): void {
    this.items = this.items.filter((p) => p.id !== item.id);
    this.events.emit("cart:changed");
  }

  clear(): void {
    this.items = [];
    this.events.emit("cart:changed");
  }

  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}