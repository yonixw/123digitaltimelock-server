import { DynamoDBClient, GetItemCommand, ListTablesCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import express from "express";

require("dotenv").config();

const app = express()
const port = 3000
const client = new DynamoDBClient({ region: "eu-central-1" });


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/getusers', async (req, res) => {
    // Set the parameters
    const params = {
        KeyConditionExpression: "id = :i",
        //FilterExpression: "contains (Subtitle, :topic)",
        ExpressionAttributeValues: {
            ":i": { S: "yonixw" },
        },
        ExpressionAttributeNames: {
            "#c": "token"
        },
        ProjectionExpression: "id,#c",
        TableName: "123digialtimelock_users",
    };

    const results = await client.send(new QueryCommand(params));
    try {
        res.send(results);
    } catch (err) {
        res.send(err);
    }
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})