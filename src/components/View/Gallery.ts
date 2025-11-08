import { Component } from "../base/Component";



interface IGallery {
  catalog: HTMLElement[];
}

export class Gallery extends Component<IGallery> {
  protected galleryElement: HTMLElement;
  constructor(container: HTMLElement) {
    super(container)
    this.galleryElement = container;
  }

  set catalog(items: HTMLElement[]) {
    this.galleryElement.replaceChildren(...items);
  }
}