async function getFastDocItems() {
    const markdowns = await findDownAll('.md')

    const fastDocLinks = []
    const fastDocCodeBlocks = []
    for (const file of markdowns) {