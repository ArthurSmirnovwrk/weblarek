import { IApi, IProductResponse, IOrder, IOrderResponse } from "../../types/index";

export class ShopAPI {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  getProducts(): Promise<IProductResponse> {
    return this.api.get<IProductResponse>("/product/");
  }

  sendOrder(order: IOrder): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>("/order/", order);
  }
}