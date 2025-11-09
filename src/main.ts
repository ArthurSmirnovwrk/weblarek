import "./scss/styles.scss";

import { API_URL } from "./utils/constants";
import { ShopAPI } from "./components/Models/ShopAPI";
import { Api } from "./components/base/Api";

import { Buyer } from "./components/Models/BuyerModel";
import { ProductsModel } from "./components/Models/ProductsModel";
import { CartModel } from "./components/Models/CartModel";

import { EventEmitter } from "./components/base/Events";
import { cloneTemplate } from "./utils/utils";
import { ensureElement } from './utils/utils';
import { IProduct, IBuyer, IOrder } from "./types/index";

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

const catalogModel = new ProductsModel(events);
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

// CATALOG
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

// PREVIEW
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

// SELECT PRODUCT
events.on("product:selected", (product: IProduct) => {
  catalogModel.setSelected(product);
});

events.on("product:change", (selected: IProduct) => {
  modal.render({
    modalContent: cardPreview.render({ ...selected }),
  });
  modal.openModal();

  const inCart = shoppingCartModel.hasItem(selected.id);

  if (!selected.price) {
    cardPreview.buttonText = "Недоступно";
    cardPreview.buttonDisabled = true;
  } else if (inCart) {
    cardPreview.buttonText = "Удалить из корзины";
    cardPreview.buttonDisabled = false;
  } else {
    cardPreview.buttonText = "Купить";
    cardPreview.buttonDisabled = false;
  }
});

// CART
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

    basket.render({
      basketList,
      basketPrice: shoppingCartModel.getTotal(),
    });
  });

events.on("basket:open", () => {
  modal.render({
    modalContent: basket.render(),
  });
  modal.openModal();
});

// FORMS
events.on("order:open", () => {
  const { payment, address } = customerModel.validate();
  const customerData = customerModel.getData();

  modal.render({
    modalContent: formOrder.render({
      payment: customerData.payment,
      address: customerData.address ?? "",
      errorForm: Object.values({ payment, address }).filter(Boolean).join(", "),
    }),
  });
  formOrder.toggleButtonForm = !payment && !address;
});

events.on("form:change", (data: { field: keyof IBuyer; value: string }) => {
  customerModel.setData({ [data.field]: data.value } as Partial<IBuyer>);
});

events.on("customer:change", (data: Partial<IBuyer>) => {
    const customerData = customerModel.getData();
    const { payment, address, email, phone } = customerModel.validate();
    
    if ("payment" in data || "address" in data) {
      formOrder.render({
        payment: customerData.payment,
        address: customerData.address ?? "",
        errorForm: Object.values({ payment, address }).filter(Boolean).join(", "),
      });
      formOrder.toggleButtonForm = !payment && !address;
    }

    if ("email" in data || "phone" in data) {
      formContacts.render({
        email: customerData.email,
        phone: customerData.phone,
        errorForm: Object.values({ email, phone }).filter(Boolean).join(", "),
      });
      formContacts.toggleButtonForm = !email && !phone;
    }
  });

events.on("order:submit", () => {
  const { email, phone } = customerModel.validate();
  const customerData = customerModel.getData();

  modal.render({
    modalContent: formContacts.render({
      email: customerData.email ?? "",
      phone: customerData.phone ?? "",
      errorForm: "",
    }),
  });
  formContacts.toggleButtonForm = !email && !phone;
});

events.on("contacts:submit", () => {
  const customerData = customerModel.getData();

  const dataOrder: IOrder = {
    payment: customerData.payment!,
    email: customerData.email!,
    phone: customerData.phone!,
    address: customerData.address!,
    total: shoppingCartModel.getTotal(),
    items: shoppingCartModel.getItems().map((p) => p.id),
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
    catalogModel.setItems(products.items);
  })
  .catch((err) => {
    console.error("Ошибка при загрузке каталога:", err);
  });
