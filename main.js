import { parse } from 'https://deno.land/std/flags/mod.ts'

import {
    sleep,
    randomId,
    createCSV,
    appendCSV,
} from './utils.js'

const {
    petition,
    period=5000,
} = parse(Deno.args)

if(typeof petition !== 'number') {
    throw new Error(`Specify petition code as --petition flag`)
}

const reportsPath = `data-${petition}-${randomId(4)}.csv`

console.log(`Saving to file '${reportsPath}'`)

await createCSV(reportsPath, [
    'timestamp',
    'apiAffirmative',
    'apiNegative',
    'htmlAffirmative',
    'htmlNegative',
])

let iter = 1

while(true) {
    let errors = false

    let apiAffirmative = NaN
    let apiNegative = NaN
    let htmlAffirmative = NaN
    let htmlNegative = NaN

    // get & parse api data
    try {
        const apiResponce = await fetch(`https://www.roi.ru/api/petition/${petition}.json`)
        const apiData = await apiResponce.json()

        apiAffirmative = apiData.data.vote.affirmative
        apiNegative    = apiData.data.vote.negative
    } catch(e) {
        errors = true
        console.log(e)
    }
    
    // get & parse html data
    try {
        const htmlResponce = await fetch(`https://www.roi.ru/${petition}/`)
        const html = await htmlResponce.text()

        const affClass = 'js-voting-info-affirmative'
        const negClass = 'js-voting-info-negative'
        const affStartIndex = html.search(affClass) + affClass.length + 2
        const negStartIndex = html.search(negClass) + negClass.length + 2

        const affEndIndex = affStartIndex + html.substring(affStartIndex).search('<')
        const negEndIndex = negStartIndex + html.substring(affStartIndex).search('<')

        const affString = html.substring(affStartIndex, affEndIndex)
        const negString = html.substring(negStartIndex, negEndIndex)

        htmlAffirmative = parseInt(
            affString.split('').filter(ch => /^\d$/.test(ch)).join('')
        )
        htmlNegative = parseInt(
            negString.split('').filter(ch => /^\d$/.test(ch)).join('')
        )
    } catch(e) {
        errors = true

        console.log(e)
    }

    // log
    if(errors) {
        console.log(iter + ': With errros')
    } else {
        console.log(iter + ': Ok')
    }

    // save
    
    appendCSV(reportsPath, {
        timestamp: new Date().toISOString(),
        apiAffirmative,
        apiNegative,
        htmlAffirmative,
        htmlNegative,
    })

    await sleep(period)
    iter += 1
}