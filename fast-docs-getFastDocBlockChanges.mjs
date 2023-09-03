import fs from "fs"
import util from 'node:util'
import childProcess from 'node:child_process'
import path from 'path'
const exec = util.promisify(childProcess.exec);
import { getFastDocItems } from './lib/fast-docs-lib.mjs'
const tempFastDocMap = {}


export async function getAllChanges() {

    const { fastDocCodeBlocks } = await getFastDocItems()

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
            const markdownCodeBlock = []
            for (let i = codeBlock.fastDocLineNumber; i < markdownLines.length; i++) {
                if (endOfCodeBlockRegex.test(markdownLines[i])) {
                    break
                } else {
                    markdownCodeBlock.push(markdownLines[i])
                }
            }


            tempFastDocMap[`${codeBlock.fastDocFile.replace(/\//g, '-')}:${codeBlock.fastDocLineNumber}`] = codeBlockLines.join("\n")
            tempFastDocMap[`${codeBlock.sourceMarkdown.replace(/\//g, '-')}:${codeBlock.fastDocStartLine}`] = markdownCodeBlock.join("\n")

        }
    }

    function markdownAndCodeAreTheSame(markdown, code) {
        if (markdown === code) {
            return true
        }
        return false
    }

    const filesWithErrors = []
    for (const codeBlock of fastDocCodeBlocks) {
        const code = tempFastDocMap[`${codeBlock.fastDocFile.replace(/\//g, '-')}:${codeBlock.fastDocLineNumber}` ]
        const markdown = tempFastDocMap[`${codeBlock.sourceMarkdown.replace(/\//g, '-')}:${codeBlock.fastDocStartLine}`]
        if (!markdownAndCodeAreTheSame(markdown, code)) {
            filesWithErrors.push(`${codeBlock.sourceMarkdown}:${codeBlock.fastDocLineNumber} - ${codeBlock.fastDocFile}:${codeBlock.fastDocStartLine}`)
        }
    }

    if (filesWithErrors.length > 0) {
        console.log()
        console.log("FreshDoc️ found differences between the code and the docs")
        for (const file of filesWithErrors) {
            console.log(file)
        }
        console.log()
        process.exit(0)
    }
}