import fs from "fs"
import util from 'node:util'
import childProcess from 'node:child_process'
import path from 'path'
const exec = util.promisify(childProcess.exec);
import { getFastDocItems } from './lib/fast-docs-lib.mjs'
const tempFastDocFolder = "./.fast-docs"

try {
    if (!fs.existsSync(tempFastDocFolder)) {
        fs.mkdirSync(tempFastDocFolder);
    }
} catch (err) {
    console.error(err);
}

const { fastDocCodeBlocks } = await getFastDocItems()

fs.writeFileSync(`${tempFastDocFolder}/.fastDocCodeBlocks.json`, JSON.stringify(fastDocCodeBlocks, null, 2))

//consolidate codeBlocks for the same source file
const fastDocCodeBlocksBySource = {}
for (const codeBlock of fastDocCodeBlocks) {
    if (!fastDocCodeBlocksBySource[codeBlock.sourceMarkdown]) {
        fastDocCodeBlocksBySource[codeBlock.sourceMarkdown] = []
    }
    fastDocCodeBlocksBySource[codeBlock.sourceMarkdown].push(codeBlock)
}

for (const codeBlockList of Object.values(fastDocCodeBlocksBySource).sort((a, b) => a[0].fastDocLineNumber - b[0].fastDocLineNumber)) {
    const markdownFileContents = fs.readFileSync(codeBlockList[0].sourceMarkdown, 'utf8')
    let markdownLines = markdownFileContents.split("\n")
    for (const codeBlock of codeBlockList) {
        const fileContents = fs.readFileSync(codeBlock.fastDocFile, 'utf8')
        const lines = fileContents.split("\n")
        const codeBlockLines = lines.slice(codeBlock.fastDocStartLine - 1, codeBlock.fastDocEndLine)
        const previousLines = markdownLines.slice(0, codeBlock.fastDocLineNumber)
        //the next lines should be the lines after the codeBlock
        const endOfCodeBlockRegex = /```/gi
        let endOfMarkdownCodeBlock = codeBlock.fastDocLineNumber
        let numberOfDeletedLines = 0
        const markdownCodeBlock = []
        for (let i = codeBlock.fastDocLineNumber; i < markdownLines.length; i++) {
            if (endOfCodeBlockRegex.test(markdownLines[i])) {
                endOfMarkdownCodeBlock = i
                break
            } else {
                markdownCodeBlock.push(markdownLines[i])
                numberOfDeletedLines++
            }
        }

        fs.writeFileSync(`${tempFastDocFolder}/${codeBlock.fastDocFile.replace(/\//g, '-')}`, codeBlockLines.join("\n"))
        fs.writeFileSync(`${tempFastDocFolder}/${codeBlock.sourceMarkdown.replace(/\//g, '-')}`, markdownCodeBlock.join("\n"))
    }
}

for (const codeBlock of fastDocCodeBlocks){
    const { stdout, stderr } = await exec(`comm -23 ${tempFastDocFolder}/${codeBlock.fastDocFile.replace(/\//g,'-')} ${tempFastDocFolder}/${codeBlock.sourceMarkdown.replace(/\//g,'-')}`)
    const lines = stdout.split("\n")
    if(stdout === ""){
        //no differences
        console.log("no differences")
    } else{
        console.log("some lines are different")
        throw new Error('stop the presses')
    }
}

