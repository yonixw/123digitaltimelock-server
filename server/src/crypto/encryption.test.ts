import { encrypt, decrypt, genKey, getKeyID } from './encryption';

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
        expect(key.length).toBeGreaterThan(15);
        expect(key.length).toBe(keyLength);
    })

    test ("keyid",()=>{
        const key ="0123";
        expect(getKeyID(key)).
            toBe("38df2cb74704cb23e8794e46e8dc26065b9d30d789a39b5d9868dfdb2d7c647a");
    })
})