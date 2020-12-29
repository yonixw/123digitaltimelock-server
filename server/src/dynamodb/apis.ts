import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { genKey, getKeyID } from '../crypto/encryption';
import { CreateKeyCommandInput, CreateKeyCommandOutput, DDB_TABLES, 
    EncKeyRow, ExpressResult } from './models';
import { ddbCreateUpdateRow } from './utils';
import { fastFail, fastData } from './models';

export async function apiCreateKey(
        client: DynamoDBClient, body: CreateKeyCommandInput, userId:string) : 
            Promise<ExpressResult<CreateKeyCommandOutput>> {
                   
    const key = body["key"] || genKey(32);
    const key_id = getKeyID(key);
    const rowData: EncKeyRow = {
        user_id: userId,
        key_id: key_id,
        key: key
    };

    const putResult = await ddbCreateUpdateRow(
        client, DDB_TABLES.ENC_KEYS, rowData
    );

    if (!putResult.ok)
        return fastFail(putResult.error);

    return fastData({key: key, key_id: key_id});
}

