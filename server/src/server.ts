import express from "express";
import fetch from 'node-fetch'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ddbQueryRowsById, ddbCreateUpdateRow } from './dynamodb/utils';

import { genKey, getKeyID } from "./crypto/encryption";
import { fastFail } from './dynamodb/models';
import { CreateKeyCommandInput, DDB_TABLES, 
    EncKeyRow, ExpressResult, fastData } from './dynamodb/models';

import {apiCreateKey} from './dynamodb/apis'

require("dotenv").config();
const client = new DynamoDBClient({ region: "eu-central-1" });

const app = express()
const port = 3000
app.use(require("morgan")("dev"));
app.use(express.json({limit:"5mb"}))


app.get('/', (req, res) => {
    res.send(fastData('OK'))
})

app.get('/getuser/:id', async (req, res) => {
    const results =
         await ddbQueryRowsById(client,DDB_TABLES.USERS,req.params.id); 
    res.send(results);
})

app.post('/createkey',async (req,res)=> {
    const body = req.body as CreateKeyCommandInput;
    const putResult = await apiCreateKey(client,body);
    res.send(putResult);
})

app.get('/createkey_example1', async (req,res)=> {
    const ep = "/createkey";
    const payload = {
        user_id:"yonixw",
        //(optional) key: genKey()
    };
    const data = await postEndpoint(ep, payload);
    res.send(data);
})

app.listen(port, () => {
    console.log(`❤ ❤ Example app listening at http://localhost:${port}`)
})


async function postEndpoint(
    ep: string, payload: CreateKeyCommandInput) {
    const test_resp = await fetch(`http://localhost:${port}${ep}`, {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await test_resp.text();
    return data;
}

