export async function base64Encode<Q extends Blob>(input: Q): Promise<string | ArrayBuffer> {
    return new Promise((resolve, _) => {
        const reader = new FileReader();
        reader.readAsDataURL(input);
        reader.onloadend = () => resolve(reader.result ? reader.result : "");
    })
}

export async function base64Decode(input: string): Promise<Blob> {
    return new Promise ((resolve, _) => {
        console.log(input);
        fetch(input)
            .then((res) => res.blob())
            .then((bb) => resolve(bb));
    })
}