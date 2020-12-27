import { encrypt, decrypt, genKey } from './encryption';

describe("test encryption",()=>{
    const data = "Hello";
    const key = "01234564789"

    test("encrypt",()=>{
        const encrypted_data = encrypt(data,key);
        console.log(`[ENC] '${encrypted_data}'`)
        expect(encrypted_data).not.toBe(data);
        expect(encrypted_data).not.toBe(key);
    })

    test("decrypt",()=>{
        const decrypted_data = decrypt(encrypt(data,key),key);
        console.log(`[DEC] '${decrypted_data}'`)
        expect(decrypted_data).toBe(data);
        expect(decrypted_data).not.toBe(key);
    })

    test("genKey",()=>{
        const keyLength = 16+Math.floor(Math.random()*16)
        const key = genKey(keyLength);
        console.log(`[KEY] ${key}`)
        expect(key.length).toBeGreaterThan(16);
        expect(key.length).toBe(keyLength);
    })
})