class SmartEvent<F extends Function> {

    private listeners: Array<F> = []

    addListener(f: F) {
        this.listeners.push(f)
    }

    trigger(message: any) {
        this.listeners.forEach(listener => listener(message))
    }

}

export class SmartBookmarkRemovedEvent
    extends SmartEvent<(url: string) => void> {
}

export class SmartBookmarkCreatedEvent
    extends SmartEvent<(url: string) => void> {
}