import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IProduct  } from "../../types/index";

export interface ICard extends Pick<IProduct, "title" | "price"> {}

export abstract class Card<T> extends Component<ICard & T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this.priceElement = ensureElement<HTMLElement>(".card__price", this.container);
        this.titleElement = ensureElement<HTMLElement>(".card__title", this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value.trim();
    }
    set price(value: number | null) {
        this.priceElement.textContent = value ? `${value} синапсов` : 'Бесценно';
    }
}