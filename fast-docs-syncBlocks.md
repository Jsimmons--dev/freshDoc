This function deals with syncing changes in your fast doc code blocks.


In order to rewrite markdown files and insert the code blocks properly, we need to take into account
which code blocks previously had contents, and when we remove it, how to offset by that amount of lines.
``` javascript @fastdoc ./fast-docs-getFastDocBlockChanges.mjs:34-43
            for (let i = codeBlock.fastDocLineNumber; i < markdownLines.length; i++) {
                if (endOfCodeBlockRegex.test(markdownLines[i])) {
                    break
                } else {
                    markdownCodeBlock.push(markdownLines[i])
                }
            }


            tempFastDocMap[`${codeBlock.fastDocFile.replace(/\//g, '-')}:${codeBlock.fastDocLineNumber}`] = codeBlockLines.join("\n")
```