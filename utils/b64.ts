export function base64Encode(data: Uint8Array): string {
    return Buffer.from(data).toString('base64');
}

export function base64Decode(input: string): Uint8Array {
    return Buffer.from(input, 'base64');
}