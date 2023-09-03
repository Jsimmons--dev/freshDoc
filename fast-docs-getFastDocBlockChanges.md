This function will find all freshDoc references in your markdown and figure out if the code
block has changed. This file does not handle updating the markdown.

This uses the core library to find all code blocks
``` javascript @fastdoc ./fast-docs-getFastDocBlockChanges.mjs:12-12
    const { fastDocCodeBlocks } = await getFastDocItems()
```



### Giving Helpful output
Giving helpful output for the changes command is currently done at the end of this file.
``` javascript @fastdoc ./fast-docs-getFastDocBlockChanges.mjs:65-73
    if (filesWithErrors.length > 0) {
        console.log()
        console.log("FreshDoc️ found differences between the code and the docs")
        for (const file of filesWithErrors) {
            console.log(file)
        }
        console.log()
        process.exit(0)
    }
```

output will be in the form freshdocReference - codeReference
```
markdownFile.md:3 - code.mjs:34
```

These names are gathered from 
``` javascript @fastdoc ./fast-docs-getFastDocBlockChanges.mjs:56-63
    const filesWithErrors = []
    for (const codeBlock of fastDocCodeBlocks) {
        const code = tempFastDocMap[`${codeBlock.fastDocFile.replace(/\//g, '-')}:${codeBlock.fastDocLineNumber}` ]
        const markdown = tempFastDocMap[`${codeBlock.sourceMarkdown.replace(/\//g, '-')}:${codeBlock.fastDocStartLine}`]
        if (!markdownAndCodeAreTheSame(markdown, code)) {
            filesWithErrors.push(`${codeBlock.sourceMarkdown}:${codeBlock.fastDocLineNumber} - ${codeBlock.fastDocFile}:${codeBlock.fastDocStartLine}`)
        }
    }
```