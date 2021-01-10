import express, { Request } from "express";
import fetch from 'node-fetch'

import { encrypt, genKey, getKeyID, signHashSalt, decrypt } from './crypto/encryption';

require("dotenv").config();
const APP_PASS = process.env.APP_SECRET;
const PASS_SIGN_SALT = "PASS_ID_HASH"
const TIME_SIGN_SALT="TIMESLOT_DATA";

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
function getPassID(inputsalt?:string):PassId {
    let result: PassId = {
        salt: "",
        pass_id: ""
    };

    result.salt = inputsalt || genKey(10);
    result.pass_id = signHashSalt(result.salt, PASS_SIGN_SALT , APP_PASS);
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
        if (signHashSalt(input.salt, PASS_SIGN_SALT , APP_PASS) === input.pass_id) {
            result = true;
        }
    } catch (error) {
        console.error(error);
    }
    resp.send({valid: result});
})

interface EncDataFile {
    encdata: string,
    passId: PassId
}

function encryptData(data:string) : EncDataFile {
    const encdata = encrypt(data, APP_PASS);
    const passId: PassId = getPassID();

    return {
        encdata,
        passId
    }
}

app.post('/encdata',(req,resp)=>{
    const data = req.body.data || "";
    resp.send(encryptData(data))
})

function adminUnlock(password: string, dataFile: EncDataFile) :string {
    let result = "Init";
    try {
        if (signHashSalt(dataFile.passId.salt, PASS_SIGN_SALT , APP_PASS) 
                    !== dataFile.passId.pass_id) {
            result = "Pass Id does not match"; // Not security!! just to avoid server mismatch
        }
        else {
            if (APP_PASS !== password) {
                result = "Password is incorrect" // Security check
            }
            else {
                result = decrypt(dataFile.encdata, APP_PASS);
            }
        }
    } catch (error) {
        result = `${error}`;
    }
    return result;
}

app.post('/admin_unlock',(req,resp)=>{
    resp.send({
        result: adminUnlock(req.body.pass, req.body.encdata)
    });
})

interface TimeSlot {
    from: number,
    to: number
    sign: string,
    passId: PassId
}

function genTimeSlot(data:string, from:number, to:number) : TimeSlot{
    
    const encdata = encryptData(data);

    let dataResult = "Init";
    if (from > to) {
        dataResult = "from>to! error!";
    }
    else {
        try {
            dataResult = signHashSalt(TIME_SIGN_SALT, `${from}|${to}|${data}`, APP_PASS);
        } catch (error) {
            dataResult = error
        }
    }

    return {
        from: from, to:to, sign: dataResult,
        passId: getPassID()
    }
}

app.post('/gen_timeslot',(req,resp)=> {
    resp.send(genTimeSlot(req.body.data,req.body.from,req.body.to));
})

function decTimeSlot(timeslot: TimeSlot, dataFile: EncDataFile) : string{
    let result = "init";
    try {
        if (signHashSalt(dataFile.passId.salt, PASS_SIGN_SALT , APP_PASS) 
                !== dataFile.passId.pass_id) {
            result = "Pass Id does not match"; // Not security!! just to avoid server mismatch
        }
        else {
            const plainData = decrypt(dataFile.encdata,APP_PASS);
            if (signHashSalt(TIME_SIGN_SALT,
                 `${timeslot.from}|${timeslot.to}|${plainData}`, APP_PASS) != timeslot.sign) {
                    result = "Timeslot sign mismatch";
            }
            else {
                const nowtime = Date.now()
                if (timeslot.from <= nowtime && timeslot.to >= nowtime ) {
                    result = plainData;
                }
                else {
                    result = "Not in time interval!";
                }
            }
        }
    } catch (error) {
        result = `${error}`
    }
    return result;
}

app.post('/dec_timeslot',(req,resp)=>{
    resp.send({result:decTimeSlot(req.body.timeslot,req.body.encdata)})
})


app.listen(port, () => {
    console.log(`❤ ❤ [APP] listening at http://localhost:${port}`)
})



