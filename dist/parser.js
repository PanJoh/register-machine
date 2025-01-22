"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseProgram = exports.parseStatement = exports.parseNumber = exports.parseJumpArg = exports.Lexer = void 0;
class Lexer {
    program;
    index = 0;
    constructor(program) {
        this.program = program;
    }
    nextToken() {
        while (this.index < this.program.length && this.program[this.index] === ' ') {
            this.index++;
        }
        if (this.index >= this.program.length) {
            return { type: 'EOF' };
        }
        let character = this.program[this.index];
        if (character === '\n') {
            this.index++;
            return { type: 'LineEnd' };
        }
        let tokenValue = '';
        while (true) {
            if (this.index >= this.program.length) {
                return { type: 'EOF' };
            }
            character = this.program[this.index];
            switch (character) {
                case ':':
                    this.index++;
                    return { type: 'label', value: tokenValue };
                case ' ':
                    this.index++;
                    return { type: 'string', value: tokenValue };
                case '\n':
                    return { type: 'string', value: tokenValue };
                default:
                    this.index++;
                    tokenValue += character;
            }
        }
    }
}
exports.Lexer = Lexer;
function parseJumpArgString(arg) {
    let isNumber = true;
    for (let index = 0; index < arg.length; index++) {
        if (!'0123456789'.split('').includes(arg[index])) {
            isNumber = false;
        }
    }
    if (isNumber) {
        return { argType: 'Number', value: BigInt(arg) };
    }
    return { argType: 'Label', name: arg };
}
function parseJumpArg(lexer) {
    const token = lexer.nextToken();
    if (token.type != 'string' || !token.value) {
        throw new Error('Error parsing jump argument');
    }
    return parseJumpArgString(token.value);
}
exports.parseJumpArg = parseJumpArg;
function parseNumber(lexer) {
    const token = lexer.nextToken();
    if (token.type != 'string' || !token.value) {
        throw new Error('error parsing number');
    }
    let isNumber = true;
    for (let index = 0; index < token.value.length; index++) {
        if (!'0123456789'.split('').includes(token.value[index])) {
            isNumber = false;
        }
    }
    if (isNumber) {
        return BigInt(token.value);
    }
    throw new Error('error parsing number');
}
exports.parseNumber = parseNumber;
function parseStatement(lexer) {
    let token = lexer.nextToken();
    while (token.type === 'LineEnd') {
        token = lexer.nextToken();
    }
    if (token.type === 'EOF') {
        return null;
    }
    if (token.type === 'label') {
        if (!token.value) {
            throw new Error('Error empty label');
        }
        return { type: 'Label', name: token.value };
    }
    if (token.type === 'string') {
        switch (token.value) {
            case 'loadImm':
                return { type: 'Instruction', inst: { commandType: 'LoadConst', value: parseNumber(lexer) } };
            case 'ld':
                return { type: 'Instruction', inst: { commandType: 'Load', address: parseNumber(lexer) } };
            case 'add':
                return { type: 'Instruction', inst: { commandType: 'Add', address: parseNumber(lexer) } };
            case 'sub':
                return { type: 'Instruction', inst: { commandType: 'Sub', address: parseNumber(lexer) } };
            case 'jmp':
                return { type: 'Instruction', inst: { commandType: 'Jump', arg: parseJumpArg(lexer) } };
            case 'jnz':
                return { type: 'Instruction', inst: { commandType: 'JumpNotZero', arg: parseJumpArg(lexer) } };
            case 'st':
                return { type: 'Instruction', inst: { commandType: 'Store', address: parseNumber(lexer) } };
            case 'hlt':
                return { type: 'Instruction', inst: { commandType: 'Halt' } };
            default:
                throw new Error(`error unsupported command ${token.value}`);
        }
    }
    return null;
}
exports.parseStatement = parseStatement;
function parseProgram(program) {
    const lexer = new Lexer(program);
    let stmt = parseStatement(lexer);
    const result = [];
    while (stmt != null) {
        result.push(stmt);
        stmt = parseStatement(lexer);
    }
    return result;
}
exports.parseProgram = parseProgram;
