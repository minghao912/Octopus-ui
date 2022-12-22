export async function base64Encode<Q extends Blob>(input: Q): Promise<string | ArrayBuffer> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.readAsDataURL(input);
        reader.onloadend = () => resolve(reader.result ? reader.result : "");
    })
}