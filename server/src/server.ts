
import express from "express";
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ddbQueryRowsById } from './dynamodb/utils';
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


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/getuser/:id', async (req, res) => {
    const results =
         await ddbQueryRowsById(client,DDB_TABLES.USERS,req.params.id); 
    res.send(results);
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})