
async function getFastDocItems() {
    const markdowns = await findDownAll('.md')

    //this is a bit of a hack, but it works
    const fastDocLinks = []
    const fastDocCodeBlocks = []
    for (const file of markdowns) {