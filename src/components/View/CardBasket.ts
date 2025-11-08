import { ensureElement } from "../../utils/utils";
import { Card } from "./Card";
import { ICardActions } from "./CardCatalog";



interface ICardBasket {
    indexProductBasket: number;
}

export class CardBasket extends Card<ICardBasket> {
    protected indexElement: HTMLElement;
    protected deleteButtonElement: HTMLButtonElement;

    constructor(container: HTMLElement,  actions?: ICardActions) {
        super(container);

        this.indexElement = ensureElement<HTMLElement>(".basket__item-index", this.container)
        this.deleteButtonElement = ensureElement<HTMLButtonElement>(".basket__item-delete", this.container)

        if (actions?.onClick) {
            this.deleteButtonElement.addEventListener("click", actions.onClick)
        }
    }

    set indexProductBasket(value: number) {
        this.indexElement.textContent = String(value);
    }
}