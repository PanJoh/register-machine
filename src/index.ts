import { Executor } from "./executor";
import { Instruction } from "./program";
import { Lexer, parseJumpArg, parseProgram, parseStatement } from "./parser";

import fs from 'fs';
import { compileProgram } from "./compiler";

const program = fs.readFileSync('./TestProgram.txt', {encoding: 'utf-8'}).toString();

const compiedProgam = compileProgram(program);

function instToString(inst: Instruction) {
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

const executor = new Executor(compiedProgam);

const result = executor.execute([4n, 5n]);

console.log();
console.log(`result: ${result.get(0n)}`);