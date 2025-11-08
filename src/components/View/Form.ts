import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";



interface IForm {
    validForm?: boolean;
    errorForm?: string;
}

export class Form<T> extends Component<IForm & T> {
    protected submitButton: HTMLButtonElement;
    protected errorElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type=submit]', this.container)
        this.errorElement = ensureElement<HTMLElement>('.form__errors', this.container)
        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit(`${(this.container as HTMLFormElement).name}:submit`);
        });
    }

    set toggleButtonForm(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errorForm(value: string) {
        this.errorElement.textContent = value.trim()
    }

    protected emitChange(field: keyof T, value: string) {
        this.events.emit('form:change', { field, value });
    }
}