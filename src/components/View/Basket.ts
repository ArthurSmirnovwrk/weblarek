import { createElement, ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";

interface IBasket {
    basketList: HTMLElement[];
    basketPrice: number;
}

export class Basket extends Component<IBasket> {
    protected basketListElement: HTMLElement;
    protected basketOrderButton: HTMLButtonElement;
    protected basketPriceElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.basketListElement = ensureElement<HTMLElement>(".basket__list", this.container);
        this.basketOrderButton = ensureElement<HTMLButtonElement>(".basket__button", this.container);
        this.basketPriceElement = ensureElement<HTMLElement>(".basket__price", this.container);

        this.basketOrderButton.addEventListener("click", () => {
            this.events.emit("order:open");
        })
    }

    set basketList(items: HTMLElement[]) {
        if (items.length) {
            this.basketListElement.replaceChildren(...items);
            this.basketOrderButton.removeAttribute("disabled");
        } else {
            this.basketListElement.replaceChildren(createElement<HTMLSpanElement>("span", {
                textContent: "Корзина пуста"
            }));
            this.basketOrderButton.setAttribute('disabled', 'true');
        }
    }

    set basketPrice(value: number) {
        this.basketPriceElement.textContent = `${value} синапсов`
    }
}