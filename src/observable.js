// @flow
type Subscription = {
    unsubscribe(): void;

    next(...args: *[]): void;
    error(...args: *[]): void;
    complete(...args: *[]): void;
};

type Observer = {
    next(...args: *[]): void;
    error(...args: *[]): void;
    complete(...args: *[]): void;
};

class SubscriptionObserver {
    source: SelfMadeActionsObservable;
    observer: Observer;

    constructor(source: SelfMadeActionsObservable, observer: Observer) {
        this.source = source;
        this.observer = observer;
    }

    unsubscribe(): void {
        this.source.unsubscribe(this);
    }

    next(...value: *[]): void {
        if (typeof this.observer.next === 'function') {
            this.observer.next(...value);
        }
    }

    error(...value: *[]): void {
        if (typeof this.observer.error === 'function') {
            this.observer.error(...value);
        }
    }

    complete(...value: *[]): void {
        if (typeof this.observer.complete === 'function') {
            this.observer.complete(...value);
        }
    }
}

export default class SelfMadeActionsObservable {
    subscriptions: ?Set<Subscription>;

    constructor() {
        this.subscriptions = new Set();
    }

    notify(...args: *[]): void {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.next(...args);
            }
        }
    }

    close(result: *): void {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.complete(result);
            }
            this.subscriptions = undefined;
        }
    }

    throw(error: *): void {
        if (this.subscriptions) {
            for (const subscription of this.subscriptions) {
                subscription.error(error);
            }
            this.subscriptions = undefined;
        }
    }

    unsubscribe(subscription : Subscription): void {
        if (this.subscriptions) {
            this.subscriptions.delete(subscription);
        }
    }

    subscribe(observer: Observer): ?Subscription {
        if (this.subscriptions) {
            const subscription = new SubscriptionObserver(this, observer);
            this.subscriptions.add(subscription);
            return subscription;
        }
        return undefined;
    }

    // $FlowFixMe
    [Symbol.observable]() {
        return this;
    }

    toPromise(): Promise<*> {
        return new Promise((resolve, reject) => {
            const subscription = this.subscribe({
                next(...value) {
                    if (subscription) {
                        subscription.unsubscribe();
                        resolve(...value);
                    }
                },
                complete() {
                    reject('Observable completed without matched elements');
                },
                error(...args) {
                    reject(...args);
                },
            });
        });
    }

    map(mapFunc: (...args: *[]) => *[]) {
        const resultObservable = new SelfMadeActionsObservable();
        this.subscribe({
            next(...value) {
                resultObservable.notify(mapFunc(...value));
            },
            complete(...args) {
                resultObservable.close(...args);
            },
            error(...args) {
                resultObservable.throw(...args);
            },
        });
        return resultObservable;
    }

    first(condition: (a: *) => bool = () => true) {
        const resultObservable = new SelfMadeActionsObservable();

        const subscription = this.subscribe({
            next(...value) {
                if (subscription) {
                    if (condition(...value)) {
                        subscription.unsubscribe();
                        resultObservable.notify(...value);
                    }
                }
            },
            complete() {
                resultObservable.throw('Observable completed without matched elements');
            },
            error(...args) {
                resultObservable.throw(...args);
            },
        });
        return resultObservable;
    }

}
