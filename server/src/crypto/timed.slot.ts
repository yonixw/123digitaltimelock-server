import {createEncryptor} from 'simple-encryptor'
import { signHash } from './encryption';


export const fastSignTimeSlot=(start: number, end:number, key:string):string =>
{
    return signHash(start +";" + end, key);
}

export const isTimeslotProofValid=(start: number, end:number, key:string, hmac: string)=> {
    return hmac === fastSignTimeSlot(start,end,key);
}

export const isInsideTimeSlot=(start: number, end:number, key:string, hmac: string)=> {
    if (isTimeslotProofValid(start,end,key,hmac)) {
        const now = Date.now();
        if (start <= now && now <= end ) {
            return true;
        }
    }
    return false;
}