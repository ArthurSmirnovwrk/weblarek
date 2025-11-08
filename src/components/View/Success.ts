import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/Events";



interface ISuccess {
    orderAmount: number;
}

export class Success extends Component<ISuccess> {
    protected successClose: HTMLButtonElement;
    protected successDescription: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.successClose = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        this.successDescription = ensureElement<HTMLElement>('.order-success__description', this.container);

        this.successClose.addEventListener('click', () => {
        this.events.emit('modal:close');
        });
    }

    set orderAmount(amount: number) {
        this.successDescription.textContent = `Списано ${amount} синапсов`
    }
}