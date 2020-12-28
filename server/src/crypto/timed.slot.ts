import {createEncryptor} from 'simple-encryptor'

export const signTimeSlot=(start: number, end:number, key:string):string =>
{
    const encryptor = createEncryptor(key);
    return encryptor.hmac(start +";" + end);
}

export const isTimeslotProofValid=(start: number, end:number, key:string, hmac: string)=> {
    return hmac === signTimeSlot(start,end,key);
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