"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const executor_1 = require("../executor");
class BufferedWriter {
    index = 0;
    buffer;
    incSize;
    constructor(incSize) {
        this.incSize = Math.max(0, Math.floor(incSize ?? 10));
        this.buffer = Buffer.alloc(this.incSize, 0);
    }
    write(byte) {
        if (this.index >= this.buffer.length) {
            const newBuffer = Buffer.alloc(this.buffer.length + this.incSize);
            this.buffer.copy(newBuffer);
            this.buffer = newBuffer;
        }
        this.buffer.writeUInt8(byte, this.index);
        this.index++;
    }
    getContent() {
        const resultBuffer = Buffer.alloc(this.index);
        this.buffer.copy(resultBuffer, 0, 0, this.index);
        return resultBuffer;
    }
}
const inFile = process.argv[2];
const input = [];
for (const arg of process.argv.slice(3)) {
    if (!isNumber(arg)) {
        continue;
    }
    input.push(BigInt(arg));
}
const inStream = (0, fs_1.createReadStream)(path_1.default.join('./', inFile));
let argBufferdWriter;
let parsingState = 'Command';
let command;
const byteToCommand = {
    1: 'add',
    3: 'jmp',
    4: 'jnz',
    5: 'ld',
    6: 'ldimm',
    7: 'st',
    8: 'sub',
};
function isNumber(str) {
    for (const char of str.split('')) {
        if (!'1234567890'.includes(char)) {
            return false;
        }
    }
    return true;
}
function argStringToBigInt(arg) {
    if (!isNumber(arg)) {
        throw new Error('argument is not a number');
    }
    return BigInt(arg);
}
function transformToAddInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for add instruction');
    }
    return { command: 'Add', i: argStringToBigInt(arg) };
}
function transformToJmpInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for jmp instruction');
    }
    return { command: 'Jump', l: argStringToBigInt(arg) };
}
function transformToJnzInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for jnz instruction');
    }
    return { command: 'JumpNotZero', l: argStringToBigInt(arg) };
}
function transformToLdInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for ld instruction');
    }
    return { command: 'Load', i: argStringToBigInt(arg) };
}
function transformToLdImmInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for ldimm instruction');
    }
    return { command: 'LoadConst', value: argStringToBigInt(arg) };
}
function transformToStInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for st instruction');
    }
    return { command: 'Store', i: argStringToBigInt(arg) };
}
function transformToSubInstruction(arg) {
    if (arg == null) {
        throw new Error('no argument given for sub instruction');
    }
    return { command: 'Sub', i: argStringToBigInt(arg) };
}
function transformToHltInstruction() {
    return { command: 'Halt' };
}
const transformMap = {
    'add': transformToAddInstruction,
    'jmp': transformToJmpInstruction,
    'jnz': transformToJnzInstruction,
    'ld': transformToLdInstruction,
    'ldimm': transformToLdImmInstruction,
    'st': transformToStInstruction,
    'sub': transformToSubInstruction,
    'hlt': transformToHltInstruction,
};
function transformToInstruction(cmd, arg) {
    const transform = transformMap[cmd];
    if (transform == null) {
        return null;
    }
    return transform(arg);
}
let programCounter = 0n;
const program = new Map();
function execute() {
    const executor = new executor_1.Executor(program);
    const registers = executor.execute(input);
    console.log(`Result: ${registers.get(0n).toString()}`);
}
function processInstruction() {
    const argBuffer = argBufferdWriter.getContent();
    const instruction = transformToInstruction(command, argBuffer.toString('utf-8'));
    if (instruction != null) {
        program.set(programCounter, instruction);
        programCounter++;
    }
}
function processByte(byte) {
    if (parsingState === 'Command') {
        if (byte === 2) {
            command = 'hlt';
            processInstruction();
            return;
        }
        const cmd = byteToCommand[byte];
        if (cmd != null) {
            command = cmd;
            argBufferdWriter = new BufferedWriter();
            parsingState = 'Delimiter';
        }
    }
    else if (parsingState === 'Delimiter') {
        parsingState = 'Argument';
    }
    else {
        if (byte === 0) {
            processInstruction();
            parsingState = 'Command';
        }
        else {
            argBufferdWriter.write(byte);
        }
    }
}
inStream.on('readable', () => {
    let chunk = inStream.read();
    if (chunk != null) {
        for (const byte of chunk) {
            processByte(byte);
        }
    }
});
inStream.on('end', () => {
    execute();
});
