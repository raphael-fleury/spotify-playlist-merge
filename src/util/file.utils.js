import fs from "fs";

export function readFileLines(file) {
    return fs.readFileSync(file, 'utf-8')
        .trim().split("\n")
        .map(x => x.replace("\r", ""))
        .filter(v => v);
}