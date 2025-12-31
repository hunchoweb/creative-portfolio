declare module 'split-type' {
  export default class SplitType {
    constructor(
      target: string | HTMLElement | NodeListOf<HTMLElement> | HTMLElement[],
      options?: {
        types?: string; // 'lines', 'words', 'chars'
        tagName?: string;
        lineClass?: string;
        wordClass?: string;
        charClass?: string;
        splitClass?: string;
        absolute?: boolean;
      }
    );
    lines: HTMLElement[] | null;
    words: HTMLElement[] | null;
    chars: HTMLElement[] | null;
    revert(): void;
  }
}

declare module 'gsap/SplitText' {
  export class SplitText {
    static create(
      target: string | Element | Element[] | NodeListOf<Element>,
      options?: {
        type?: string;
        wordsClass?: string;
        charsClass?: string;
        linesClass?: string;
      }
    ): SplitText;
    
    constructor(
      target: string | Element | Element[] | NodeListOf<Element>,
      options?: {
        type?: string;
        wordsClass?: string;
        charsClass?: string;
        linesClass?: string;
      }
    );
    
    chars: Element[];
    words: Element[];
    lines: Element[];
    revert(): void;
  }
}

