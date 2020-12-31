import {createEncryptor} from 'simple-encryptor'

const padKey = (key:string): string => {
    if (key.length < 16 ){
        return ("0000000000000000" + key).substr(-16);
    }
    return key;
}

const key_source="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()~`;'"
export const genKey = (keyLength:number=32) : string => {
    let result = "";
    for (let i = 0; i < keyLength ; i++) {
        result += key_source.charAt(Math.floor(Math.random()*key_source.length));
    }
    return result;
}

export const getKeyID= (key:string) => {
    const enc = createEncryptor(padKey(key));
    return enc.hmac("keyid").substring(0,10);
}

export const encrypt = (plaintext:string, key:string) :string => {
    const enc = createEncryptor(padKey(key));
    return enc.encrypt(plaintext);
}

export const decrypt = (encryptdata:string, key:string) :string => {
    const dec = createEncryptor(padKey(key));
    return dec.decrypt(encryptdata);
}