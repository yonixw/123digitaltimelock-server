import express, { Request } from "express";
import fetch from 'node-fetch'

import { genKey, getKeyID, signHashSalt } from './crypto/encryption';

require("dotenv").config();
const APP_PASS = process.env.APP_SECRET;
const APP_SIGN_DATA = "PASS_ID_HASH"

const app = express()
const port = 3000
app.use(require("morgan")("dev"));
app.use(express.json({ limit: "5mb" }))
app.use(require('cors')({
    origin: '*',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

interface PassId {
    salt:string, pass_id: string
}
function getPassID(inputsalt:string):PassId {
    let result: PassId = {
        salt: "",
        pass_id: ""
    };

    result.salt = inputsalt || genKey(10);
    result.pass_id = signHashSalt(result.salt, APP_SIGN_DATA , APP_PASS);
    return result;
}

app.post('/pass_id',(req,resp)=> {
    let result: PassId = getPassID(req.body.salt);
    resp.send(result);
})

app.post('/verify_pass_id', (req,resp)=>{
    let input: PassId = req.body;
    let result = false;
    try {
        if (signHashSalt(input.salt, APP_SIGN_DATA , APP_PASS) === input.pass_id) {
            result = true;
        }
    } catch (error) {
        console.error(error);
    }
    resp.send({valid: result});
})

app.listen(port, () => {
    console.log(`❤ ❤ [APP] listening at http://localhost:${port}`)
})



