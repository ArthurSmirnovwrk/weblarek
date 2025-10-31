import "./scss/styles.scss";

import { API_URL } from "./utils/constants";

import { apiProducts } from "./utils/data";
import { BuyerModel } from "./components/Models/BuyerModel";
import { ProductsModel } from "./components/Models/ProductsModel";
import { CartModel } from "./components/Models/CartModel";
import { ShopAPI } from "./components/Models/ShopAPI";

import { IOrder, TPayment } from "./types/index";


const catalog = new ProductsModel();
const cart = new CartModel();
const buyer = new BuyerModel();

catalog.setItems(apiProducts.items);

console.log("Массив товаров из каталога: ", catalog.getItems());

cart.addItem(apiProducts.items[0]);
console.log("Товары в корзине: ", cart.getItems());
console.log("Общая стоимость: ", cart.getTotal());
buyer.setData({ email: "Ivanov@mail.ru", payment: "cash" });
console.log("Данные покупателя: ", buyer.getData());

const api = new ShopAPI(API_URL);

api.getProducts().then((products) => {
  console.log("Товары с сервера:", products);
});

const test: IOrder = {
  items: ["854cef69-976d-4c2a-a18c-2aa45046c390"],
  total: 750,
  buyer: {
    payment: "cash" as TPayment,
    phone: "1111111111111",
    email: "Ivanov@mail.ru",
    address: "11111111111111",
  },
};

api.orderProducts(test).then((order) => {
  console.log("Заказ отправлен:", order);
});

