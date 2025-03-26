declare module 'aos' {
  export interface AosOptions {
    offset?: number;
    delay?: number;
    duration?: number;
    easing?: string;
    once?: boolean;
    mirror?: boolean;
    anchorPlacement?: string;
    startEvent?: string;
    animatedClassName?: string;
    initClassName?: string;
    useClassNames?: boolean;
    disableMutationObserver?: boolean;
    throttleDelay?: number;
    debounceDelay?: number;
  }

  export default {
    init: (options?: AosOptions) => void,
    refresh: (initialize?: boolean) => void,
    refreshHard: () => void
  };
}