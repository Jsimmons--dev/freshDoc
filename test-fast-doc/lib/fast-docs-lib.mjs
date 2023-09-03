import fs from 'fs'
import path from 'path'
import { findDownAll } from 'vfile-find-down'

let markdownLinkRegex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(([^\)]+)\))/gi

let markdownFastDocCodeBlocksRegex = /``` javascript @fastdoc .*/gi

function matchWithLineNumber(str, re) {
    return str.split(/[\r\n]/).map(function (line, i) {
      if (re.test(line)) {
        return {
          line: line,
          number: i + 1,
          match: line.match(re)[0]
        };
      }
    }).filter(Boolean);
  };

async function getFastDocItems() {
    const markdowns = await findDownAll('.md')

    //this is a bit of a hack, but it works
    const fastDocLinks = []
    const fastDocCodeBlocks = []
    for (const file of markdowns) {
        const fileContents = fs.readFileSync(file.history[0], 'utf8')
        //this spread feels weird
        let links = [...fileContents.matchAll(markdownLinkRegex)].map((m) => ({ text: m[1], link: m[2] }))
        const fastDocLines = matchWithLineNumber(fileContents, markdownFastDocCodeBlocksRegex)
        for (const fastDocLine of fastDocLines) {
            const [language, fastDocMarker, fastDocDeclaration] = fastDocLine.line.slice(3).trim().split(" ")
            const [fastDocFile, fastDocLines] = fastDocDeclaration.split(":")
            const [fastDocStartLine, fastDocEndLine] = fastDocLines.split("-").map((line) => parseInt(line))
            fastDocCodeBlocks.push({
                sourceMarkdown: file.history[0],
                language,
                fastDocLine: fastDocLine.line,
                fastDocLineNumber: fastDocLine.number,
                numberOfLinesInDocBlock: fastDocEndLine - (fastDocStartLine - 1),
                fastDocMarker,
                fastDocFile: path.resolve(path.dirname(file.history[0]) + "/" + fastDocFile),
                fastDocStartLine,
                fastDocEndLine,
            })
        }

        const fileDir = path.dirname(file.history[0])
        for (let link of links) {
            fastDocLinks.push(path.resolve(fileDir + "/" + link.link))
        }
    }
    return { fastDocLinks, fastDocCodeBlocks }
}

export { getFastDocItems }
