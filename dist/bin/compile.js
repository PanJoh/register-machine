"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const compiler_1 = require("../compiler");
const asmFile = process.argv[2];
const outFile = process.argv[3];
const program = (0, fs_1.readFileSync)(path_1.default.join('./', asmFile), { encoding: 'utf-8' }).toString();
const compiledProgram = (0, compiler_1.compileProgram)(program);
function convertFromInstruction(inst) {
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
const outStream = (0, fs_1.createWriteStream)(path_1.default.join('./', outFile), { encoding: 'utf-8' });
for (const inst of instructions) {
    outStream.write(convertFromInstruction(inst));
    outStream.write(Buffer.from([0]));
}
outStream.close();
