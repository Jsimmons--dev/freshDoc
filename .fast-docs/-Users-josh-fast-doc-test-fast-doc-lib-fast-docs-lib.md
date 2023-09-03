
async function getFastDocItems() {
    const markdowns = await findDownAll('.md')

    const fastDocLinks = []
    const fastDocCodeBlocks = []
    for (const file of markdowns) {
        const fileContents = fs.readFileSync(file.history[0], 'utf8')