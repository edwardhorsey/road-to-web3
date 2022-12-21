export interface MemoRaw {
    from: string;
    timestamp: number;
    message: string;
    name: string;
    amount: string;
}

export interface Memo {
    address: string;
    timestamp: Date;
    message: string;
    name: string;
    amount: string;
}
