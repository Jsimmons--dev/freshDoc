
This method uses the vfile-find-down package to go and get every Markdown file in the project.
You can also optionally pass a single file path if you only want to change that one file.
You need to use findDownAll and not findDown, otherwise you only get the first result.
    
``` javascript @freshdoc ./freshdoc-lib.mjs:25-31
//lib/freshdoc-lib.mjs:25-31
  let files;
  if (fileName) {
    files = [fileName];
  } else {
    const markdowns = await findDownAll(".md");
    files = markdowns.map((file) => file.history[0]);
  }
```

This method will then take every link it can find in the file and strip it out and return it.
