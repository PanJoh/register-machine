"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterMachine = exports.RegisterFile = void 0;
class RegisterFile {
    registers = new Map();
    get(i) {
        return this.registers.get(i) ?? 0n;
    }
    set(i, value) {
        this.registers.set(i, value);
    }
    get Registers() {
        return new Map(this.registers);
    }
}
exports.RegisterFile = RegisterFile;
class RegisterMachine {
    registers = new RegisterFile();
    programCounter = 0n;
    constructor(initialValues) {
        for (const [index, value] of initialValues.entries()) {
            this.registers.set(BigInt(index), value);
        }
    }
    loadConst(value) {
        this.registers.set(0n, value);
        this.programCounter++;
    }
    load(i) {
        this.registers.set(0n, this.registers.get(i));
        this.programCounter++;
    }
    store(i) {
        this.registers.set(i, this.registers.get(0n));
        this.programCounter++;
    }
    add(i) {
        this.registers.set(0n, this.registers.get(0n) + this.registers.get(i));
        this.programCounter++;
    }
    sub(i) {
        this.registers.set(0n, this.registers.get(0n) - this.registers.get(i));
        this.programCounter++;
    }
    jump(l) {
        this.programCounter = l;
    }
    jumpNotZero(l) {
        if (this.registers.get(0n) !== 0n) {
            this.programCounter = l;
        }
        else {
            this.programCounter++;
        }
    }
    get ProgramCounter() {
        return this.programCounter;
    }
    get Registers() {
        return this.registers.Registers;
    }
}
exports.RegisterMachine = RegisterMachine;
