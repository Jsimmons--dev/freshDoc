
This method uses the vfile-find-down package to go and get every Markdown file in the project.
You need to use findDownAll and not findDown, otherwise you only get the first result.
    
``` javascript @freshdoc ./freshdoc-lib.mjs:22-22
//lib/freshdoc-lib.mjs:22-22
    const markdowns = await findDownAll('.md')
```

This method will then take every link it can find in the file and strip it out and return it.
