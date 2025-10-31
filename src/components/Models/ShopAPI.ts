import { IApi, IProduct, IOrder, IOrderResponse } from "../../types/index";

export class ShopAPI {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProducts(): Promise<IProduct[]> {
    return this.api.get<IProduct[]>("/product/");
  }

  sendOrder(order: IOrder): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order/", order);
  }
}