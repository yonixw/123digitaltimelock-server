import { ExpressResult, fastData, fastFail } from './models';
import { 
    DynamoDBClient, GetItemCommand, ListTablesCommand,
    PutItemCommand,
    PutItemInput,
    QueryCommand, QueryInput 
} from '@aws-sdk/client-dynamodb'
const {wrap,unwrap} = require('dynamodb-data-types').AttributeValue;

//https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property

export  const ddbQueryRowsById = async (
    client: DynamoDBClient,
    tableName:string, id: string,
    idAttributeName:string="id",
    projection:string[] = [], limit=1) : Promise<ExpressResult<Array<any>>> => {

    const attrId : {[key: string]: string;} = {
        "#c0": idAttributeName
    }

    for (let i = 0; i < projection.length; i++) {
        const p = projection[i];
        if (p!=idAttributeName)
            attrId["#c"+(i+1)]=p;
    }

    let projectionString = projection.length > 0 ? 
                                    Object.keys(attrId).join(',') : null;

    const params : QueryInput = {
        KeyConditionExpression: "#c0 = :i",
        //FilterExpression: "contains (Subtitle, :topic)",
        ExpressionAttributeValues: {
            ":i": { S: id },
        },
        ExpressionAttributeNames: attrId,
        ProjectionExpression: projectionString,
        TableName: tableName,
        Limit: limit
    };

    try {
        const results = await client.send(new QueryCommand(params));
        if (results.$metadata.httpStatusCode >= 400)
            return fastFail(results);
        return fastData(results.Items.map(e=>unwrap(e)));
    } catch (err) {
        return fastFail(err);
    }
}


export  const ddbCreateUpdateRow = async (
    client: DynamoDBClient,
    tableName:string, item: any): Promise<ExpressResult<void>> => {

    const params : PutItemInput = {
        Item: wrap(item),
        TableName: tableName,

    };

    try {
        const results = await client.send(new PutItemCommand(params));
        if (results.$metadata.httpStatusCode >= 400)
            return fastFail(results);
        return fastData(unwrap(results.Attributes));
    } catch (err) {
        return fastFail(err);
    }
}

