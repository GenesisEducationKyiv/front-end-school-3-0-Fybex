import { useEffect, useRef } from "react";

/**
 * useEventListener - Attach an event listener to a target (default: window) with automatic cleanup.
 * @param event - The event type (e.g. 'keydown')
 * @param handler - The event handler function
 * @param options - Optional: { target, options } where target is the event target (default: window)
 */
function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (ev: WindowEventMap[K]) => void,
  options?: {
    target?: EventTarget | null;
    options?: boolean | AddEventListenerOptions;
  }
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const target = options?.target ?? window;
    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };
    target.addEventListener(event, eventListener, options?.options);
    return () => {
      target.removeEventListener(event, eventListener, options?.options);
    };
  }, [event, options?.target, options?.options]);
}

export default useEventListener;
