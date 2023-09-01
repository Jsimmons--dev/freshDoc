import fs from "fs"
import { getFastDocItems } from './lib/fast-docs-lib.mjs'

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
        let endOfMarkdownCodeBlock = codeBlock.fastDocLineNumber
        let numberOfDeletedLines = 0
        for (let i = codeBlock.fastDocLineNumber; i < markdownLines.length; i++) {
            if (endOfCodeBlockRegex.test(markdownLines[i])) {
                endOfMarkdownCodeBlock = i
                break
            } else {
                numberOfDeletedLines++
            }
        }

        const nextLines = markdownLines.slice(endOfMarkdownCodeBlock)

        markdownLines = [...previousLines, ...codeBlockLines, ...nextLines]
        //update future codeBlocks in the list to properly offset by added lines
        for (const futureCodeBlock of codeBlockList) {
            futureCodeBlock.fastDocLineNumber += codeBlockLines.length - numberOfDeletedLines
        }
        fs.writeFileSync(codeBlock.sourceMarkdown, markdownLines.join("\n"))
    }
}

