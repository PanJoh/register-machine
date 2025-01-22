import { createReadStream } from "fs";
import path from "path";
import { Instruction } from "../program";
import { Executor } from "../executor";


class BufferedWriter {
    private index = 0;
    private buffer: Buffer;
    private incSize: number;

    constructor(incSize?: number) {
        this.incSize = Math.max(0, Math.floor(incSize ?? 10));
        this.buffer = Buffer.alloc(this.incSize, 0);
    }

    write(byte: number) {
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

const input: bigint[] = [];

for (const arg of process.argv.slice(3)) {
    if (!isNumber(arg)) {
        continue;
    }

    input.push(BigInt(arg));
}

const inStream = createReadStream(path.join('./', inFile));

let argBufferdWriter: BufferedWriter;

let parsingState: 'Command' | 'Argument' | 'Delimiter' = 'Command';

let command: string;

const byteToCommand: {[byte: number]: string} = {
    1: 'add',
    3: 'jmp',
    4: 'jnz',
    5: 'ld',
    6: 'ldimm',
    7: 'st',
    8: 'sub',
}

function isNumber(str: string): boolean {
    for (const char of str.split('')) {
        if (!'1234567890'.includes(char)) {
            return false;
        }
    }

    return true;
}

function argStringToBigInt(arg: string): bigint {
    if (!isNumber(arg)) {
        throw new Error('argument is not a number');
    }

    return BigInt(arg);
}

function transformToAddInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for add instruction');
    }

    return { command: 'Add', i: argStringToBigInt(arg)};
} 

function transformToJmpInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for jmp instruction');
    }

    return { command: 'Jump', l: argStringToBigInt(arg)};
}

function transformToJnzInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for jnz instruction');
    }

    return { command: 'JumpNotZero', l: argStringToBigInt(arg)};
}

function transformToLdInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for ld instruction');
    }

    return { command: 'Load', i: argStringToBigInt(arg)};
}

function transformToLdImmInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for ldimm instruction');
    }
    
    return { command: 'LoadConst', value: argStringToBigInt(arg)};
}

function transformToStInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for st instruction');
    }

    return { command: 'Store', i: argStringToBigInt(arg)};
}

function transformToSubInstruction(arg?: string): Instruction {
    if (arg == null) {
        throw new Error('no argument given for sub instruction');
    }

    return { command: 'Sub', i: argStringToBigInt(arg)};
}

function transformToHltInstruction(): Instruction {
    return { command: 'Halt'};
}

const transformMap: {[inst: string]: (arg?: string) => Instruction} = {
    'add': transformToAddInstruction,
    'jmp': transformToJmpInstruction,
    'jnz': transformToJnzInstruction,
    'ld': transformToLdInstruction,
    'ldimm': transformToLdImmInstruction,
    'st': transformToStInstruction,
    'sub': transformToSubInstruction,
    'hlt': transformToHltInstruction,
};

function transformToInstruction(cmd: string, arg?: string) {
    const transform = transformMap[cmd];
    if (transform == null) {
        return null;
    }

    return transform(arg);
}

let programCounter = 0n;

const program = new Map<bigint, Instruction>();

function execute() {
    const executor = new Executor(program);

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

function processByte(byte: number) {
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
    } else if (parsingState === 'Delimiter') {
        parsingState = 'Argument';
    } else {
        if (byte === 0) {
            processInstruction();
            parsingState = 'Command';
        } else {
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