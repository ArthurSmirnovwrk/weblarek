import { IEvents } from "../base/Events";
import { ensureElement } from "../../utils/utils";
import { Form } from "./Form";



interface IFormContact {
    email: string;
    phone: string;
}

export class FormContact extends Form<IFormContact> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(events, container);
        this.emailInput = ensureElement<HTMLInputElement>("input[name=email]", this.container);
        this.phoneInput = ensureElement<HTMLInputElement>("input[name=phone]", this.container);

        this.emailInput.addEventListener("input", () => {
            this.emitChange("email", this.emailInput.value);
        });

        this.phoneInput.addEventListener("input", () => {
            this.emitChange("phone", this.phoneInput.value);
        });
    }

    set email(value: string) {
        this.emailInput.value = value ?? "";
    }
    set phone(value: string) {
        this.phoneInput.value = value ?? "";
    }
}