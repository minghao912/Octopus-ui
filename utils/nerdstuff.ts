export function getHumanReadableSize(bytes: number): string {
    function _toThreeDigits(num: number): number {
        return Math.round((num + Number.EPSILON) * 10) / 10;
    }

    let kb, mb, gb;
    if ((kb = bytes / 1000) < 1)
        return `${_toThreeDigits(bytes)} B`;
    else if ((mb = kb / 1000) < 1)
        return `${_toThreeDigits(kb)} KB`;
    else if ((gb = mb / 1000) < 1)
        return `${_toThreeDigits(mb)} MB`;
    else return `${_toThreeDigits(gb)} GB`;
}