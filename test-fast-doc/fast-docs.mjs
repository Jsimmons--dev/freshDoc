import { getChangedFiles } from './fileManager.mjs'
import { getFastDocItems } from './lib/fast-docs-lib.mjs'


const {fastDocLinks, fastDocCodeBlocks} = await getFastDocItems()

const changedFiles = await getChangedFiles()

const filteredArray = fastDocLinks.filter(value => changedFiles.includes(value));
if (filteredArray.length > 0) {
    //I let the co-pilot generate this string... it feels very corporate
    console.log("The following files are referenced in the documentation but have been changed:")
    for(let file of filteredArray) {
        console.log(file)
    }
}

