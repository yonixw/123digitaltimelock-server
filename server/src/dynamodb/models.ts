export const DDB_TABLES = {
    "USERS": "123digialtimelock_users",
    "SLOTS": "123digialtimelock_timeslots",
    "ENC_KEYS": "123digialtimelock_keys",
    "ENC_DATA": "123digialtimelock_data"
}


export interface EncKeyRow {
    user_id: string;    // Partition Key
    key_id: string;     // Range key
    key: string;
    nickname: string;
}

export interface DataEncRow {
    user_id: string;    // Partition Key
    data_id: string;    // Range key
    key_id: string;     
    data_enc_val: string;
    nickname: string;
}


// ========== EXPRESS RESULT

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

