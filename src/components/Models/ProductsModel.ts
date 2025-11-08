import { IProduct } from "../../types/index";
import { IEvents } from "../base/Events";

export class ProductsModel {
  private items: IProduct[] = [];
  private selected: IProduct | null = null;

  constructor(private events: IEvents) {}
  
  setItems(items: IProduct[]): void {
    this.items = items;
    this.events.emit('catalog:change');
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItem(id: string): IProduct | undefined {
    return this.items.find((item) => item.id === id);
  }

  setSelected(item: IProduct): void {
    this.selected = item;
  }

  getSelected(): IProduct | null {
    return this.selected;
  }
}