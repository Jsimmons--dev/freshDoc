import childProcess from 'node:child_process'
import util from 'node:util'
import path from 'path'
const exec = util.promisify(childProcess.exec);

async function getChangedFiles() {
    const { stdout, stderr } = await exec('git diff --name-only HEAD')
    return stdout.split('\n').filter(f => f !== '').map(f => path.resolve(f))
}

function parseSingleLineChangesToLineNumbers(singleLineChangeHunkMatches) {
    let matches
    for (const match of singleLineChangeHunkMatches) {
        const [header, fromLine, toLine] = match
        matches = [+fromLine]
    }
    return matches
}

function parseJustLinesAddedToLineNumbers(justLinesAddedHunkMatches) {
    let matches
    for (const match of justLinesAddedHunkMatches) {
        const [header, fromLine, toLine, linesAdded] = match
        matches = [+fromLine, +linesAdded]
    }

    const [fromLine, linesAdded] = matches
    const lines = new Array(linesAdded)
    for (let i = 0; i < linesAdded; i++) {
        lines[i] = fromLine + i
    }
    return lines
}

function parseJustLinesDeletedToLineNumbers(justLinesDeletedHunkMatches) {
    let matches
    for (const match of justLinesDeletedHunkMatches) {
        const [header, fromLine, linesDeleted, newStartLine] = match
        matches = [+fromLine, +linesDeleted]
    }

    const [fromLine, linesAdded] = matches
    const lines = new Array(linesAdded)
    for (let i = 0; i < linesAdded; i++) {
        lines[i] = fromLine + i
    }
    return lines
}

async function getChangedFilesWithDiff() {
    const { stdout, stderr } = await exec('git --no-pager diff  -U0')
    const diffs = []
    const diffLineRegex = /^diff .*/g
    let currentDiff = []
    for (const line of stdout.split('\n')) {
        if (diffLineRegex.test(line)) {
            diffs.push(currentDiff)
            currentDiff = []
        }
        currentDiff.push(line)
    }
    function formatFileDiff(diff) {
        function formatHunk(hunk) {
            const [header, ...lines] = hunk
            const regexForSingleLineChange = /@@ \-([1-9][0-9]*) \+([1-9][0-9]*) @@/g
            const regexForJustLinesAdded = /@@ \-([1-9][0-9]*) \+([1-9][0-9]*),([0-9]*) @@/g
            const regexForJustLinesDeleted = /@@ \-([1-9][0-9]*),([1-9]*) \+([0-9]*),0 @@/g
            const regexs = [
                { operation: 'singleLineChange', regex: regexForSingleLineChange, handler: parseSingleLineChangesToLineNumbers },
                { operation: 'justLinesAdded', regex: regexForJustLinesAdded, handler: parseJustLinesAddedToLineNumbers },
                { operation: 'justLinesDeleted', regex: regexForJustLinesDeleted, handler: parseJustLinesDeletedToLineNumbers },
            ]
            for (const { operation, regex, handler } of regexs) {
                if (header.match(regex)) {
                    const lineChanges = handler(header.matchAll(regex))
                    console.log(lineChanges)
                    return { operation, lineChanges, header, lines }
                }
            }
            throw new Error('header did not match any known operation types')
        }
        const [header, indexInfo, fromFile, toFile, ...rawHunks] = diff
        const diffLineRegex = /^@@[^@]*@@/g
        const hunks = []
        let currentHunk = []
        for (const line of rawHunks) {
            if (diffLineRegex.test(line)) {
                hunks.push(currentHunk)
                currentHunk = []
            }
            currentHunk.push(line)
        }
        hunks.push(currentHunk)
        console.log(hunks)
        return { header, indexInfo, fromFile, toFile, hunks: hunks.slice(1).map(formatHunk) }
    }

    return diffs.slice(1).map(formatFileDiff)
}

export { getChangedFiles, getChangedFilesWithDiff }