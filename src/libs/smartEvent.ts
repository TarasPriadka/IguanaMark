/**
 * Event class to trigger events when bookmarks are updated in the SmartMark folder.
 */
class SmartEvent<F extends Function> {

    private listeners: Array<F> = []

    addListener(f: F) {
        this.listeners.push(f)
    }

    trigger(message: any) {
        this.listeners.forEach(listener => listener(message))
    }

}

/**
 * Event for bookmark removal
 */
export class SmartBookmarkRemovedEvent
    extends SmartEvent<(url: string) => void> {
}

/**
 * Event for bookmark creation
 */
export class SmartBookmarkCreatedEvent
    extends SmartEvent<(url: string) => void> {
}
