import express, { Request } from "express";
import fetch from 'node-fetch'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ddbQueryRowsById, ddbCreateUpdateRow } from './dynamodb/utils';

import { genKey, getKeyID } from "./crypto/encryption";
import { fastFail } from './dynamodb/models';
import {
    DDB_TABLES,
    EncKeyRow, ExpressResult, fastData
} from './dynamodb/models';

import { apiCreateEncData, apiCreateKey, apiDecDataByFullKey,
     apiListUserKeys, CreateKeyCommandInput, DecDataFullKeyCommandInput,
      EncDataCommandInput } from './dynamodb/apis';
import { ddbBasicAuth } from "./dynamodb/utils";
import { setUpExamples } from "./server.examples";

require("dotenv").config();
const client = new DynamoDBClient({ region: "eu-central-1" });

const app = express()
const port = 3000
app.use(require("morgan")("dev"));
app.use(ddbBasicAuth(client)); // will store user in header "xuser"
app.use(express.json({ limit: "5mb" }))

app.get('/', (req, res) => {
    const userId = req.headers.xuser;
    res.send(fastData('OK - user:' +userId ))
})

app.post('/createkey', async (req, res) => {
    const userId = req.headers.xuser as string;
    const body = req.body as CreateKeyCommandInput;
    const putResult = await apiCreateKey(client, body,userId);
    res.send(putResult);
})

app.post('/createdata',async (req,res)=> {
    const userId = req.headers.xuser as string;
    const body = req.body as EncDataCommandInput;
    const putResult = await apiCreateEncData(client, body,userId);
    res.send(putResult);
})

app.post('/decryptdata',async (req,res)=> {
    const userId = req.headers.xuser as string;
    const body = req.body as DecDataFullKeyCommandInput;
    const putResult = await apiDecDataByFullKey(client, body,userId);
    res.send(putResult);
})

app.get('/listkeys', async (req, res) => {
    const userId = req.headers.xuser as string;
    const listResult = await apiListUserKeys(client, userId);
    res.send(listResult);
})

setUpExamples(app,port)

app.listen(port, () => {
    console.log(`❤ ❤ [APP] listening at http://localhost:${port}`)
})

