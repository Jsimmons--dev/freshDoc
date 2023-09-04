
This method uses the vfile-find-down package to go and get every Markdown file in the project.
You need to use findDownAll and not findDown, otherwise you only get the first result.
    
``` javascript @freshdoc ./freshdoc-lib.mjs:20-27

export async function getItems() {
    const markdowns = await findDownAll('.md')

    const markdownLinks = []
    const codeBlocks = []
    for (const file of markdowns) {
        const fileContents = fs.readFileSync(file.history[0], 'utf8')
```

This method will then take every link it can find in the file and strip it out and return it.
