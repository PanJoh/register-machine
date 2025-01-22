"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const executor_1 = require("./executor");
const fs_1 = __importDefault(require("fs"));
const compiler_1 = require("./compiler");
const program = fs_1.default.readFileSync('./TestProgram.txt', { encoding: 'utf-8' }).toString();
const compiedProgam = (0, compiler_1.compileProgram)(program);
function instToString(inst) {
    switch (inst.command) {
        case 'Add':
            return `add ${inst.i}`;
        case 'Halt':
            return 'hlt';
        case 'Jump':
            return `jmp ${inst.l}`;
        case 'JumpNotZero':
            return `jnz ${inst.l}`;
        case 'Load':
            return `ld ${inst.i}`;
        case 'LoadConst':
            return `ldimm ${inst.value}`;
        case 'Store':
            return `st ${inst.i}`;
        case 'Sub':
            return `sub ${inst.i}`;
    }
}
for (const [key, inst] of compiedProgam) {
    console.log(`${key}: ${instToString(inst)}`);
}
const executor = new executor_1.Executor(compiedProgam);
const result = executor.execute([4n, 5n]);
console.log();
console.log(`result: ${result.get(0n)}`);
