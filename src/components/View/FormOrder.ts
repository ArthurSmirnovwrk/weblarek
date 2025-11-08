import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/Events";
import { Form } from "./Form";
import { TPayment } from "../../types/index";



interface IFormOrder {
    payment: TPayment;
    address: string;
}

export class FormOrder extends Form<IFormOrder> {
    protected buttonOnlinePayment: HTMLButtonElement;
    protected buttonOfflinePayment: HTMLButtonElement;
    protected addressDeliveryInput: HTMLInputElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(events, container);
        this.buttonOnlinePayment = ensureElement<HTMLButtonElement>("button[name=card]", this.container);
        this.buttonOfflinePayment = ensureElement<HTMLButtonElement>("button[name=cash]", this.container);

        this.addressDeliveryInput = ensureElement<HTMLInputElement>("input[name=address]", this.container);

        this.buttonOnlinePayment.addEventListener("click", () => {
            this.emitChange("payment", "card");
        });
        this.buttonOfflinePayment.addEventListener("click", () => {
            this.emitChange("payment", "cash");
        });
        this.addressDeliveryInput.addEventListener("input", () => {
            this.emitChange("address", this.addressDeliveryInput.value);
        });
    }

    set payment(value: TPayment) {
        this.buttonOnlinePayment.classList.toggle("button_alt-active", value === "card");
        this.buttonOfflinePayment.classList.toggle("button_alt-active", value === "cash");
    }

    set address(value: string) {
        this.addressDeliveryInput.value= value
    }
}