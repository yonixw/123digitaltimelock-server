import express from "express";
import fetch from 'node-fetch'

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ddbQueryRowsById, ddbCreateUpdateRow } from './dynamodb/utils';

import { genKey, getKeyID } from "./crypto/encryption";

require("dotenv").config();

const client = new DynamoDBClient({ region: "eu-central-1" });
const DDB_TABLES = {
    "USERS": "123digialtimelock_users",
    "SLOTS": "123digialtimelock_timeslots",
    "ENC_KEYS": "123digialtimelock_keys",
    "ENC_DATA": "123digialtimelock_data"
}

const app = express()
const port = 3000
app.use(express.json({limit:"5mb"}))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/getuser/:id', async (req, res) => {
    const results =
         await ddbQueryRowsById(client,DDB_TABLES.USERS,req.params.id); 
    res.send(results);
})

interface CreateKeyCommand {
    user_id: string,
    key: string
}
interface EncKeyRow {
    user_id: string;
    key_id: string;
    key: string;
}

app.post('/createkey',async (req,res)=> {
    const body = req.body as CreateKeyCommand;
    if (!body["key"] || !body["user_id"])
        res.send("Error: missing data in post");
    else {
        const key_id = getKeyID(body.key);
        const rowData : EncKeyRow = {
            user_id: body.user_id,
            key_id: key_id,
            key: body.key
        }
        try {
            const putResult = await ddbCreateUpdateRow(
                client,DDB_TABLES.ENC_KEYS,rowData
            );
            res.send(putResult);
        } catch (error) {
            res.send(error);
        }

    }
})

app.get('/createkey_example1', async (req,res)=> {
    const test_resp = await fetch(`http://localhost:${port}/createkey`,{
        method:"POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            user_id:"yonixw",
            key: genKey()
        })
    })
    const  data = await test_resp.text();
    res.send(data);
})

app.listen(port, () => {
    throw new Error("Implement storng class for ERROR or OK results, because now some are empty!!");
    
    console.log(`Example app listening at http://localhost:${port}`)
})