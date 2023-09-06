import fs from "fs"
import { getItems } from './lib/freshdoc-lib.mjs'
const referenceMap = {}


function buildMarkdownReference(sourceMarkdown, markdownFreshDocReferenceLineNumber) {
    return `${sourceMarkdown.replace(/\//g, '-')}:${markdownFreshDocReferenceLineNumber}`
}

function buildCodeReference(referencedCodeFilename, codeBlockRangeStart) {
    return `${referencedCodeFilename.replace(/\//g, '-')}:${codeBlockRangeStart}`
}

export async function getAllChanges() {

    const { codeBlocks } = await getItems()

    //consolidate codeBlocks for the same source file
    const codeBlocksBySource = {}
    for (const codeBlock of codeBlocks) {
        const { sourceMarkdown } = codeBlock
        if (!codeBlocksBySource[sourceMarkdown]) {
            codeBlocksBySource[sourceMarkdown] = []
        }
        codeBlocksBySource[sourceMarkdown].push(codeBlock)
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
            const markdownCodeBlock = []
            //account for the commented reference to the location by adding 1
            for (let i = markdownFreshDocReferenceLineNumber + 1; i < markdownLines.length; i++) {
                if (endOfCodeBlockRegex.test(markdownLines[i])) {
                    break
                } else {
                    markdownCodeBlock.push(markdownLines[i])
                }
            }


            referenceMap[buildCodeReference(referencedCodeFilename, codeBlockRangeStart)] = codeBlockLines.join("\n")
            referenceMap[buildMarkdownReference(sourceMarkdown, markdownFreshDocReferenceLineNumber)] = markdownCodeBlock.join("\n")
        }
    }

    function markdownAndCodeAreTheSame(markdown, code) {
        if (markdown === code) {
            return true
        }
        return false
    }

    const filesWithErrors = []
    for (const codeBlock of codeBlocks) {
        const { sourceMarkdown, referencedCodeFilename,
            codeBlockRangeStart, codeBlockRangeEnd, markdownFreshDocReferenceLineNumber,
        } = codeBlock
        const code = referenceMap[buildCodeReference(referencedCodeFilename, codeBlockRangeStart)]
        const markdown = referenceMap[buildMarkdownReference(sourceMarkdown, markdownFreshDocReferenceLineNumber)]
        if (!markdownAndCodeAreTheSame(markdown, code)) {
            filesWithErrors.push(`${sourceMarkdown}:${markdownFreshDocReferenceLineNumber} != ${referencedCodeFilename}:${codeBlockRangeStart}`)
        }
    }

    if (filesWithErrors.length > 0) {
        console.log()
        console.log("FreshDoc️ found differences the Docs and the Code")
        for (const file of filesWithErrors) {
            console.log(file)
        }
        console.log()
        process.exit(0)
    }
}
