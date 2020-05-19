export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
export function randomId(length) {
    let id = ''

    for(let i = 0; i < length; i += 1) {
        id += alphabet[
            Math.floor( Math.random() * alphabet.length )
        ]
    }

    return id
}

const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8')
const columnWidth = 24

export async function createCSV(path, header) {
    await Deno.writeFile(
        path,
        encoder.encode(
            header.map(col => col.padStart(columnWidth, ' ')).join(';')
        )
    )
}

export async function appendCSV(path, report) {
    const newLine = Object.keys(report).map(
        col => report[col].toString().padStart(columnWidth, ' ')
    ).join(';')
    
    const oldFile = await Deno.readFile(path)
    const oldCsv  = decoder.decode(oldFile)

    const newCsv = oldCsv + '\n' + newLine

    const newFile = encoder.encode(newCsv)
    await Deno.writeFile(path, newFile)
}