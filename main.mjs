import { getAllChanges } from './fast-docs-getFastDocBlockChanges.mjs'
import { syncAllBlocks } from './fast-docs-syncBlocks.mjs'
import { program } from 'commander'

program.name("freshDocs")

program
  .command('sync' )
  .description('Sync all blocks')
  .action(() => {
    syncAllBlocks()
  })

program
  .command('changes')
  .description('Get all changes')
  .action(() => {
    getAllChanges()
  })

program.parse();
