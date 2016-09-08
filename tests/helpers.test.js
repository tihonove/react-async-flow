import { expect } from 'chai';
import { event, anyOf } from '../src/index';

describe('anyOf', () => {
    it('should return action of first fired event', async () => {
        const eventObject1 = event();
        const eventObject2 = event();
        const promise = anyOf(eventObject1, eventObject2);
        eventObject1('arg1', 'arg2');
        const result = await promise;
        expect(result.event).to.equal(eventObject1);
        expect(result.payload).to.eql(['arg1', 'arg2']);
    });

    it('should process "as" function', async () => {
        const eventObject1 = event();
        const eventObject2 = event();
        const promise = anyOf(eventObject1.as(false), eventObject2.as(true));
        eventObject1('arg1', 'arg2');
        const result = await promise;
        expect(result).to.equal(false);
    });

    it('should process "as" function and plain event', async () => {
        const eventObject1 = event();
        const eventObject2 = event();
        const promise1 = anyOf(eventObject1.as(false), eventObject2);
        eventObject1();
        expect(await promise1).to.equal(false);

        const promise2 = anyOf(eventObject1.as(false), eventObject2);
        eventObject2('arg1', 'arg2');
        const result = await promise2;
        expect(result.event).to.equal(eventObject2);
        expect(result.payload).to.eql(['arg1', 'arg2']);
    });

    it('should process "map" function', async () => {
        const eventObject1 = event();
        const eventObject2 = event();
        const promise1 = anyOf(eventObject1.map(({ event }) => event), eventObject2.map(({ event }) => event));
        eventObject1();
        expect(await promise1).to.equal(eventObject1);

        const promise2 = anyOf(eventObject1.map(({ event }) => event), eventObject2.map(({ event }) => event));
        eventObject2();
        expect(await promise2).to.equal(eventObject2);
    });
});
