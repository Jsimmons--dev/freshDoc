``` javascript @freshdoc ./main.mjs:5-5
//main.mjs:5-5
program.name("freshDocs")
```

# The Way That It Works
FreshDoc works by parsing your markdown files and finding all of the code blocks that have a freshDoc reference. We then allow you to keep these in sync using the sync command.

If your files get out of sync and you need to review them first. For example, if you have moved a code block, you can use the changes command to see what has changed.

Example FreshDoc reference
````
``` javascript @freshdoc ./Readme.md:11-11
//Readme.md:11-11
Example FreshDoc reference
```
````

A reference is composed of the following:
- The language of the code block. Only javascript is currently supported.
- the annotation @freshdoc so our engine can find the code block.
- The file that the code block is in.
- The line number of the code block always specified as n-m. You can show one line of code using n-n as in the example.

# Commands
## Changes
``` javascript @freshdoc ./main.mjs:14-19
//main.mjs:14-19
program
  .command('changes')
  .description('Get all changes')
  .action(() => {
    getAllChanges()
  })
```

More details on the 'changes' command can be found [here](./getBlockChanges.md)

## Sync
Syncing changes to blocks 
``` javascript @freshdoc ./main.mjs:7-12
//main.mjs:7-12
program
  .command('sync' )
  .description('Sync all blocks')
  .action(() => {
    syncAllBlocks()
  })
```

More details on the 'sync' command can be found [here](./syncBlocks.md)