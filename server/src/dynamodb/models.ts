export const DDB_TABLES = {
    "USERS": "123digialtimelock_users",
    "SLOTS": "123digialtimelock_timeslots",
    "ENC_KEYS": "123digialtimelock_keys",
    "ENC_DATA": "123digialtimelock_data"
}

export interface ExpressResult<T> {
    ok: boolean,
    error?: string | any,
    data: T | ""
}
export function fastData<T>(data:T) : ExpressResult<T> {
    return {ok:true,data: data}
}
export function fastFail<T>(error:string|any) : ExpressResult<T> {
        return {ok:false, error: error, data: ""}
}


export interface CreateKeyCommandInput {
    key?: string
}

export interface CreateKeyCommandOutput {
    key: string,
    key_id: string,
}

export interface EncKeyRow {
    user_id: string;    // Partition Key
    key_id: string;     // Range key
    key: string;
}


export interface CreateDataCommandInput {
    data: string,
    user_id: string,
    key?: string,
    key_id?: string,
}

export interface CreateDataCommandOutput {
    data_id: string
}

export interface DataEncKeyRow {
    user_id: string;    // Partition Key
    key_id: string;     // Range key
    enc_data: string;
}