"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
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
function processByte(byte) {
    if (parsingState === 'Command') {
        if (byte === 2) {
            console.log('hlt');
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
            const argBuffer = argBufferdWriter.getContent();
            console.log(`${command} ${argBuffer.toString('utf-8')}`);
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
