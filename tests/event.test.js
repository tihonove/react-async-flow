import { expect } from 'chai';
import { event } from '../src/index';

describe('event', () => {
    it('should resolve take', async () => {
        const eventObject = event();
        const promise = eventObject.take();
        eventObject();
        await promise;
    });

    it('should resolve two takes', async () => {
        const eventObject = event();
        const promise1 = eventObject.take();
        const promise2 = eventObject.take();
        eventObject();
        await promise1;
        await promise2;
    });

    it('should resolve in reverse order', async () => {
        const eventObject = event();
        const promise1 = eventObject.take();
        const promise2 = eventObject.take();
        eventObject();
        await promise2;
        await promise1;
    });

    it('should return arguments array', async () => {
        const eventObject = event();
        const promise = eventObject.take();
        eventObject('arg1', 'arg2');
        expect(await promise).to.eql(['arg1', 'arg2']);
    });

    it('should return arguments array', async () => {
        const eventObject = event();
        const promise = eventObject.take();
        eventObject('arg1', 'arg2');
        expect(await promise).to.eql(['arg1', 'arg2']);
    });

    it('should be callable many times', async () => {
        const eventObject = event();

        const promise1 = eventObject.take();
        eventObject('arg1');
        expect(await promise1).to.eql(['arg1']);

        const promise2 = eventObject.take();
        eventObject('arg2');
        expect(await promise2).to.eql(['arg2']);
    });

    it('should not resolve before call', async () => {
        const eventObject = event();

        eventObject('arg1');
        const promise1 = eventObject.take();
        eventObject('arg2');
        expect(await promise1).to.eql(['arg2']);
    });

    it('should not resolve before call', async () => {
        const eventObject = event();

        eventObject('arg1');
        const promise1 = eventObject.take();
        eventObject('arg2');
        expect(await promise1).to.eql(['arg2']);
    });
});
