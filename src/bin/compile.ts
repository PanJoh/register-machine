import { createWriteStream, readFileSync } from "fs";
import path from "path";
import { compileProgram } from "../compiler";
import { Instruction } from "../program";

const asmFile = process.argv[2];
const outFile = process.argv[3];

const program = readFileSync(path.join('./', asmFile), {encoding: 'utf-8'}).toString();
const compiledProgram = compileProgram(program);



function convertFromInstruction(inst: Instruction) {
    switch (inst.command) {
        case 'Add':
            return Buffer.concat([Buffer.from([1, 0]), Buffer.from(`${inst.i.toString()}`)]);
        case 'Halt':
            return Buffer.from([2]);
        case 'Jump':
            return Buffer.concat([Buffer.from([3, 0]), Buffer.from(`${inst.l.toString()}`)]);
        case 'JumpNotZero':
            return Buffer.concat([Buffer.from([4, 0]), Buffer.from(`${inst.l.toString()}`)]);
        case 'Load':
            return Buffer.concat([Buffer.from([5, 0]), Buffer.from(`${inst.i.toString()}`)]);
        case 'LoadConst':
            return Buffer.concat([Buffer.from([6, 0]), Buffer.from(`${inst.value.toString()}`)]);
        case 'Store':
            return Buffer.concat([Buffer.from([7, 0]), Buffer.from(`${inst.i.toString()}`)]);
        case 'Sub':
            return Buffer.concat([Buffer.from([8, 0]), Buffer.from(`${inst.i.toString()}`)]);
    }
}

const instructions = Array
    .from(compiledProgram).sort(([addr1], [addr2]) => addr1 < addr2 ? -1 : 1)
    .map(([, inst]) => inst);

const outStream = createWriteStream(path.join('./', outFile), {encoding: 'utf-8'})

for (const inst of instructions) {
    outStream.write(convertFromInstruction(inst));
    outStream.write(Buffer.from([0]));
}

outStream.close();