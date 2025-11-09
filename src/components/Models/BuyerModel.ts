import { IBuyer } from "../../types/index";
import { IEvents } from "../base/Events";

export class BuyerModel {
  protected data: Partial<IBuyer> = {};

  setData(newData: Partial<IBuyer>): void {
    this.data = { ...this.data, ...newData };
  }

  getData(): Partial<IBuyer> {
    return this.data;
  }

  clear(): void {
    this.data = {};
    this.events.emit("customer:change", this.data);
  }

  validate(): Record<keyof IBuyer, string> {
    const errors: Record<keyof IBuyer, string> = {} as Record<keyof IBuyer, string>;

    if (!this.data.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.data.email?.trim()) errors.email = "Укажите e-mail";
    if (!this.data.phone?.trim()) errors.phone = "Укажите телефон";
    if (!this.data.address?.trim()) errors.address = "Необходимо указать адрес";

    return errors;
  }

  constructor(protected events: IEvents) {}
}

export class Buyer extends BuyerModel {
  constructor(events: IEvents) {
    super(events);
  }

  setData(newData: Partial<IBuyer>): void {
    super.setData(newData);
    this.events.emit("customer:change", newData);
  }
}