import fs from "fs";
import path from "path";
import { findDownAll } from "vfile-find-down";

const markdownLinkRegex = /(?=\[(!\[.+?\]\(.+?\)|.+?)]\(([^\)]+)\))/gi;

const markdownFreshDocCodeBlocksRegex = /``` *[a-zA-Z0-9]* @freshdoc .*/gi;

function matchWithLineNumber(str, re) {
  return str
    .split(/[\r\n]/)
    .map(function (line, i) {
      if (re.test(line)) {
        return {
          line: line,
          number: i + 1,
          match: line.match(re)[0],
        };
      }
    })
    .filter(Boolean);
}

export async function getItems() {
  const markdowns = await findDownAll(".md");

  const markdownLinks = [];
  const codeBlocks = [];
  for (const file of markdowns) {
    const fileContents = fs.readFileSync(file.history[0], "utf8");
    //this spread feels weird
    let links = [...fileContents.matchAll(markdownLinkRegex)].map((m) => ({
      text: m[1],
      link: m[2],
    }));
    const lines = matchWithLineNumber(
      fileContents,
      markdownFreshDocCodeBlocksRegex,
    );
    for (const line of lines) {
      const [language, freshDocReference, declaration] = line.line
        .slice(3)
        .trim()
        .split(" ");
      const [referencedFile, codeBlockRange] = declaration.split(":");
      const [codeBlockRangeStart, codeBlockRangeEnd] = codeBlockRange
        .split("-")
        .map((line) => parseInt(line));
      codeBlocks.push({
        sourceMarkdown: file.history[0],
        language,
        markdownFreshDocReference: line.line,
        markdownFreshDocReferenceLineNumber: line.number,
        numberOfLinesInDocBlock: codeBlockRangeEnd - (codeBlockRangeStart - 1),
        referencedCodeFilename: path.resolve(
          path.dirname(file.history[0]) + "/" + referencedFile,
        ),
        codeBlockRangeStart,
        codeBlockRangeEnd,
      });
    }

    const fileDir = path.dirname(file.history[0]);
    for (let link of markdownLinks) {
      links.push(path.resolve(fileDir + "/" + link.link));
    }
  }
  return { links: markdownLinks, codeBlocks };
}
