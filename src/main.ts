import "./scss/styles.scss";

import { API_URL } from "./utils/constants";

import { apiProducts } from "./utils/data";
import { BuyerModel } from "./components/Models/BuyerModel";
import { ProductsModel } from "./components/Models/ProductsModel";
import { CartModel } from "./components/Models/CartModel";
import { ShopAPI } from "./components/Models/ShopAPI";

import { Api } from "./components/base/Api";


const testCatalog = new ProductsModel();
const testCart = new CartModel();
const testBuyer = new BuyerModel();

testCatalog.setItems(apiProducts.items);
console.log("Массив товаров из каталога:", testCatalog.getItems());
console.log(
  "Товар найден:",
  testCatalog.getItem("854cef69-976d-4c2a-a18c-2aa45046c390")
);
testCatalog.setSelected(apiProducts.items[1]);
console.log("Выбран продукт:", testCatalog.getSelected());

testCart.addItem(apiProducts.items[1]);

console.log("Товары в корзине:", testCart.getItems());
console.log(`Общая стоимость: ${testCart.getTotal()} у.е.`);

testCart.clear();
console.log(`В корзине: ${testCart.getCount()}`);

testBuyer.setData({
  address: "11111111111111",
  payment: "cash",
  phone: "1111111111111",
  email: "Ivanov@mail.ru",
});
console.log(testBuyer.getData(), testBuyer.validate());
testBuyer.clear();
console.log(testBuyer.getData(), testBuyer.validate());

const api = new Api(API_URL);
const shopAPI = new ShopAPI(api);
const newProductsModel = new ProductsModel();

shopAPI
  .getProducts()
  .then((products) => {
    console.log("Каталог товаров:", products);
    newProductsModel.setItems(products);
  })
  .catch((err) => {
    console.error("Ошибка при загрузке каталога:", err);
  });
