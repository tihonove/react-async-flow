import Observable from './observable';

export function event() {
    const observable = new Observable();

    const result = function(...args) {
        observable.notify({ event: result, payload: args });
    };

    result[Symbol.observable] = function() {
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

export function anyOf(...events) {
    return Promise.race(events.map(x => x[Symbol.observable]().toPromise()));
}
