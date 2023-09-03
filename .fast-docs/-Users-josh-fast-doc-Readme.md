program
  .command('changes')
  .description('Get all changes')
  .action(() => {
    getAllChanges()
  })