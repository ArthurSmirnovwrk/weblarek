import "./scss/styles.scss";

import { API_URL } from "./utils/constants";
import { ShopAPI } from "./components/Models/ShopAPI";
import { Api } from "./components/base/Api";

import { Buyer } from "./components/Models/BuyerModel"; // <- используем Buyer (с events)
import { ProductsModel } from "./components/Models/ProductsModel";
import { CartModel } from "./components/Models/CartModel";

import { EventEmitter } from "./components/base/Events";
import { cloneTemplate } from "./utils/utils";
import { ensureElement } from './utils/utils';
import { IProduct, IBuyer, TPayment, IOrder } from "./types/index";

import { Header } from "./components/View/Header";
import { Basket } from "./components/View/Basket";
import { Gallery } from "./components/View/Gallery";
import { Modal } from "./components/View/Modal";
import { Success } from "./components/View/Success";

import { CardBasket } from "./components/View/CardBasket";
import { CardCatalog } from "./components/View/CardCatalog";
import { CardPreview } from "./components/View/CardPreview";

import { FormContact } from "./components/View/FormContact";
import { FormOrder } from "./components/View/FormOrder";

const api = new Api(API_URL);
const shopAPI = new ShopAPI(api);
const events = new EventEmitter();

const catalogModel = new ProductsModel();
const customerModel = new Buyer(events);
const shoppingCartModel = new CartModel(events);

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const basket = new Basket(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#basket')));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const successOrder = new Success(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#success')));

const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), events);
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const formOrder = new FormOrder(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#order')));
const formContacts = new FormContact(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#contacts')));

events.on("catalog:change", () => {
  const productCards = catalogModel.getItems().map((product) => {
    const card = new CardCatalog(
      cloneTemplate(ensureElement<HTMLTemplateElement>("#card-catalog")),
      { onClick: () => events.emit("product:selected", product) }
    );
    return card.render(product);
  });
  gallery.render({ catalog: productCards });
});

events.on("preview:click", () => {
  const product = catalogModel.getSelected();
  if (!product) {
    return;
  }
  if (!shoppingCartModel.hasItem(product.id)) {
    shoppingCartModel.addItem(product);
  } else {
    shoppingCartModel.removeItem(product);
  }
  modal.closeModal();
});

events.on("product:selected", (product: IProduct) => {
  catalogModel.setSelected(product);

  const selected = catalogModel.getSelected();
  if (!selected) return;

  modal.render({
    modalContent: cardPreview.render({ ...selected }),
  });
  modal.openModal();

  const inCart = shoppingCartModel.hasItem(selected.id);
  if (!selected.price) {
    cardPreview.buttonTextToggle("Недоступно", true);
  } else if (inCart) {
    cardPreview.buttonTextToggle("Удалить из корзины", false);
  } else {
    cardPreview.buttonTextToggle("Купить", false);
  }
});

events.on("cart:changed", () => {
  header.counter = shoppingCartModel.getCount();
  const basketList = shoppingCartModel
    .getItems()
    .map((product, index) => {
      const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
        onClick: () => {
          shoppingCartModel.removeItem(product);
        },
      });
      card.indexProductBasket = index + 1;
      return card.render(product);
    });

  const basketPrice = shoppingCartModel.getTotal();
  basket.render({
    basketList,
    basketPrice,
  });
});

events.on("basket:open", () => {
  modal.render({
    modalContent: basket.render(),
  });
  modal.openModal();
});

events.on("order:open", () => {
  const { payment, address } = customerModel.validate();
  const customerData = customerModel.getData();

  modal.render({
    modalContent: formOrder.render({
      payment: customerData.payment,
      address: customerData.address ?? "",
      validForm: !payment && !address,
      errorForm: "",
    }),
  });
});

events.on("form:change", (data: { field: keyof IBuyer; value: string }) => {
  switch (data.field) {
    case "payment":
      customerModel.setPayment(data.value as TPayment);
      break;
    case "address":
      customerModel.setAddress(data.value);
      break;
    case "email":
      customerModel.setEmail(data.value);
      break;
    case "phone":
      customerModel.setPhone(data.value);
      break;
  }
  events.emit("customer:change", data);
});

events.on("customer:change", (data: { field: keyof IBuyer; value: string }) => {
    const customerData = customerModel.getData();
    const { payment, address, email, phone } = customerModel.validate();
    
    if (data.field === "payment" || data.field === "address") {
      formOrder.render({
        payment: customerData.payment,
        address: customerData.address ?? "",
        validForm: !payment && !address,
        errorForm: Object.values({ payment, address })
          .filter(Boolean)
          .join(", "),
      });
    }

    if (["email", "phone"].includes(data.field)) {
      formContacts.render({
        email: customerData.email,
        phone: customerData.phone,
        validForm: !email && !phone,
        errorForm: Object.values({ email, phone }).filter(Boolean).join(", "),
      });
    }
  }
);

events.on("order:submit", () => {
  const { email, phone } = customerModel.validate();
  const customerData = customerModel.getData();

  modal.render({
    modalContent: formContacts.render({
      email: customerData.email ?? "",
      phone: customerData.phone ?? "",
      validForm: !email && !phone,
      errorForm: "",
    }),
  });
});

events.on("contacts:submit", () => {
  const customerData = customerModel.getData();

  if (!customerData.payment || !customerData.address || !customerData.email || !customerData.phone) {
    events.emit("order:open");
    return;
  }

  const dataOrder: IOrder = {
    payment: customerData.payment,
    email: customerData.email,
    phone: customerData.phone,
    address: customerData.address,
    total: shoppingCartModel.getTotal(),
    items: shoppingCartModel.getItems().map((product) => product.id),
  };

  shopAPI.sendOrder(dataOrder).then((res) => {
    modal.render({
      modalContent: successOrder.render({
        orderAmount: res.total,
      }),
    });
    shoppingCartModel.clear();
    customerModel.clear();
  })
  .catch((err) => {
    console.error("Ошибка при отправке заказа:", err);
  })
});


events.on("modal:close", () => {
  modal.closeModal();
});

shopAPI
  .getProducts()
  .then((products) => {
    const items = products.items;
    catalogModel.setItems(items);
    events.emit("catalog:change");
  })
  .catch((err) => {
    console.error("Ошибка при загрузке каталога:", err);
  });
