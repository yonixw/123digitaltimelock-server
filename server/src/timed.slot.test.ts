import { genKey } from './encryption';
import { signTimeSlot, isTimeslotProofValid, isInsideTimeSlot } from './timed.slot';
describe("time slot test",()=> {
    const key=genKey();

    const beforeNow = Date.now() - 1000;
    const now = Date.now();
    const now1h = now + 60*60*1000;
    

    test("simple hmac",()=>{
        const proof = signTimeSlot(now,now1h, key);    

        expect(isTimeslotProofValid(now,now1h,key, proof)).toBe(true)
        expect(isInsideTimeSlot(now,now1h,key, proof)).toBe(true)
        
        expect(isTimeslotProofValid(now+1,now1h,key, proof)).toBe(false)
    })

    test("invalid time slot",()=>{
        const proof = signTimeSlot(beforeNow,now-1, key);

        expect(isTimeslotProofValid(beforeNow,now-1,key, proof)).toBe(true)
        expect(isInsideTimeSlot(beforeNow,now-1,key, proof)).toBe(false)
    })
})