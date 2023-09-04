import fs from "fs"
import { getItems } from './lib/freshdoc-lib.mjs'

export async function syncAllBlocks() {
    const { codeBlocks } = await getItems()

    //consolidate codeBlocks for the same source file
    const codeBlocksBySource = {}
    for (const codeBlock of codeBlocks) {
        if (!codeBlocksBySource[codeBlock.sourceMarkdown]) {
            codeBlocksBySource[codeBlock.sourceMarkdown] = []
        }
        codeBlocksBySource[codeBlock.sourceMarkdown].push(codeBlock)
    }

    for (const codeBlockList of Object.values(codeBlocksBySource).sort((a, b) => a[0].fastDocLineNumber - b[0].fastDocLineNumber)) {
        const markdownFileContents = fs.readFileSync(codeBlockList[0].sourceMarkdown, 'utf8')
        let markdownLines = markdownFileContents.split("\n")
        for (const codeBlock of codeBlockList) {
            const { sourceMarkdown, referencedCodeFilename,
                codeBlockRangeStart, codeBlockRangeEnd, markdownFreshDocReferenceLineNumber,
            } = codeBlock

            const fileContents = fs.readFileSync(referencedCodeFilename, 'utf8')
            const lines = fileContents.split("\n")
            const codeBlockLines = lines.slice(codeBlockRangeStart - 1, codeBlockRangeEnd)
            const previousLines = markdownLines.slice(0, markdownFreshDocReferenceLineNumber)
            //the next lines should be the lines after the codeBlock
            const endOfCodeBlockRegex = /```/gi
            let endOfMarkdownCodeBlock = markdownFreshDocReferenceLineNumber
            let numberOfDeletedLines = 0
            for (let i = markdownFreshDocReferenceLineNumber; i < markdownLines.length; i++) {
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
            fs.writeFileSync(sourceMarkdown, markdownLines.join("\n"))
        }
    }
}