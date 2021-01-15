import express, { Request } from "express";
import fetch from 'node-fetch'


import { RESTPost } from './tsexpress/handlers';
import { PassHashId, getAppPassHashID, PASS_SIGN_SALT, APP_PASS, EncryptState, encryptData, appPassDecrypt, SignedTimeslot, timeslotDecrypt, signTimeslot, IBY, createIBY, IBYSlot, createIBYSlot, decryptIBYSlot } from './api';
import { signHashSalt } from './crypto/encryption';



const app = express()
const port = 3000
app.use(require("morgan")("dev"));
app.use(express.json({ limit: "5mb" }))
app.use(require('cors')({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))




// ===========


interface PassIDInput  {salt?:string}

RESTPost<PassIDInput,PassHashId>("/pass_id", app, async (body,h,u)=> {
    return getAppPassHashID(body.salt);
})

RESTPost<PassHashId,boolean>("/verify_pass_id", app, async (body,h,u)=> {
    if (signHashSalt(body.salt, PASS_SIGN_SALT , APP_PASS) === body.pass_id) {
        return true;
    }
    return false;
})

interface EncryptInput {plaintext:string}
RESTPost<EncryptInput,EncryptState>("/encdata", app,  async (body,h,u)=> {
    const data = body.plaintext|| "";
    return encryptData(data);
})

interface PasswordDecryptInput  {pass:string, encdata: EncryptState};
RESTPost<PasswordDecryptInput,string>("/admin_unlock", app, async (body,h,u)=> {
    return appPassDecrypt(body.pass, body.encdata);
})

interface SignTimeslotInput {plaintext:string,from:number,to:number};
RESTPost<SignTimeslotInput,SignedTimeslot>("/gen_timeslot", app, async (body,h,u)=> {
    return signTimeslot(body.plaintext,body.from,body.to,)
})

interface DecryptTimeslotInput {timeslotProof:SignedTimeslot,encdata:EncryptState};
RESTPost<DecryptTimeslotInput,string>("/dec_timeslot", app, async (body,h,u)=> {
    return timeslotDecrypt(body.timeslotProof,body.encdata)
})

// ===========

interface IBYInput {plaintext:string}
RESTPost<IBYInput,IBY>("/make_iby", app, async (body,h,u)=> {
    return createIBY(body.plaintext);
})

interface IBYSlotInput {iby:IBY,from:number, to:number}
RESTPost<IBYSlotInput,IBYSlot>("/make_iby_slot", app, async (body,h,u)=> {
    return createIBYSlot(body.iby,body.from,body.to);
})

RESTPost<IBYSlot,string>("/dec_iby_slot", app, async (body,h,u)=> {
    return decryptIBYSlot(body)
})

app.listen(port, () => {
    console.log(`❤ ❤ [APP] listening at http://localhost:${port}`)
})



