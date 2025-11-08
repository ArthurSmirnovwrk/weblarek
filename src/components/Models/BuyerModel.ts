import { IBuyer, TPayment } from "../../types/index";
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
  }

  validate(): Record<keyof IBuyer, string> {
    const errors: Record<keyof IBuyer, string> = {} as Record<keyof IBuyer, string>;

    if (!this.data.payment) errors.payment = "Не выбран вид оплаты";
    if (!this.data.email?.trim()) errors.email = "Укажите e-mail";
    if (!this.data.phone?.trim()) errors.phone = "Укажите телефон";
    if (!this.data.address?.trim()) errors.address = "Необходимо указать адрес";

    return errors;
  }

  isComplete(): boolean {
    const d = this.data;
    return !!(d.payment && d.email && d.phone && d.address);
  }
}

export class Buyer extends BuyerModel {
  constructor(private events: IEvents) {
    super();
  }

  setPayment(payment: TPayment): void {
    this.setData({ payment });
  }

  setEmail(email: string): void {
    this.setData({ email });
  }

  setPhone(phone: string): void {
    this.setData({ phone });
  }

  setAddress(address: string): void {
    this.setData({ address });
    if (address.length > 100) {
      throw new Error("Address length exceeds 100 characters");
    }
  }
  
  requestOrderValidation(): void {
    const validation = this.validate();
    this.events.emit("order:validate", validation);
  }

  requestContactsValidation(): void {
    const validation = this.validate();
    this.events.emit("contacts:validate", validation);
  }
}