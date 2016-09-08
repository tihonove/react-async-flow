// @flow
import Observable from './observable';

type EventObject = {

};

export function event(): EventObject {
    const observable = new Observable();

    const result = function(...args) {
        observable.notify({ event: result, payload: args });
    };

    // $FlowFixMe
    result[Symbol.observable] = function(): Observable {
        return observable;
    };

    result.map = function(mapFunc) {
        return observable.map(mapFunc);
    };

    result.as = function(value) {
        return observable
            .map(() => value);
    };

    result.take = function() {
        return observable
            .first()
            .map(({ payload }) => payload)
            .toPromise();
    };

    return result;
}

export function anyOf(...events: EventObject[]) {
    // $FlowFixMe
    return Promise.race(events.map(x => x[Symbol.observable]().toPromise()));
}
