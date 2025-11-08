import { ensureElement } from "../../utils/utils";
import { CDN_URL } from '../../utils/constants';

import { categoryMap } from "../../utils/constants";
import { Card } from "./Card";

import { TCategory } from "./CardCatalog";
import { IProduct  } from "../../types/index";
import { IEvents } from "../base/Events";



interface ICardPreview extends Pick<IProduct, "title" | "price" | "image" | "category" | "description"> {};

export class CardPreview extends Card<ICardPreview> {
    
    protected buttonPreviewElement: HTMLButtonElement;
    protected imageElement: HTMLImageElement;
    protected categoryElement: HTMLElement;
    protected descriptionElement: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.events = events;
        
        this.descriptionElement = ensureElement<HTMLElement>(".card__text", this.container);
        this.buttonPreviewElement = ensureElement<HTMLButtonElement>(".card__button", this.container);
        this.imageElement = ensureElement<HTMLImageElement>(".card__image", this.container);
        this.categoryElement = ensureElement<HTMLElement>(".card__category", this.container);

        this.buttonPreviewElement.addEventListener("click", () => {
            this.events.emit("preview:click");
        });
    }

    buttonTextToggle(value: string, boolean: boolean) {
        this.buttonPreviewElement.textContent = value;
        this.buttonPreviewElement.disabled = boolean;
    }

    set image(value: string) {
        this.setImage(this.imageElement, `${CDN_URL}${value.replace(".svg", ".png")}`, this.title);
    }

    set category(value: TCategory) {
        this.categoryElement.textContent = value;

        for (const key in categoryMap) {
            this.categoryElement.classList.toggle(
                categoryMap[key as TCategory],
                key === value
            );
        }
    }

    set description(value: string) {
        this.descriptionElement.textContent = value.trim();
    }
}