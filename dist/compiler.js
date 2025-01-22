"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileProgram = void 0;
const parser_1 = require("./parser");
function getJumpAddress(jumpArg, labelMap) {
    if (jumpArg.argType === 'Number') {
        return jumpArg.value;
    }
    const value = labelMap.get(jumpArg.name);
    if (value == null) {
        throw new Error(`Label ${jumpArg.name} is not defined`);
    }
    return value;
}
function compileProgram(program) {
    const ast = (0, parser_1.parseProgram)(program);
    let programCounter = 0n;
    const labelMap = new Map();
    for (const stmt of ast) {
        if (stmt.type === 'Label') {
            if (labelMap.has(stmt.name)) {
                throw new Error(`Label ${stmt.name} allready defined`);
            }
            labelMap.set(stmt.name, programCounter);
        }
        else {
            programCounter++;
        }
    }
    programCounter = 0n;
    const result = new Map();
    for (const stmt of ast) {
        if (stmt.type === 'Label') {
            continue;
        }
        switch (stmt.inst.commandType) {
            case 'Add':
                result.set(programCounter, { command: 'Add', i: stmt.inst.address });
                break;
            case 'Sub':
                result.set(programCounter, { command: 'Sub', i: stmt.inst.address });
                break;
            case 'Halt':
                result.set(programCounter, { command: 'Halt' });
                break;
            case 'Load':
                result.set(programCounter, { command: 'Load', i: stmt.inst.address });
                break;
            case 'LoadConst':
                result.set(programCounter, { command: 'LoadConst', value: stmt.inst.value });
                break;
            case 'Store':
                result.set(programCounter, { command: 'Store', i: stmt.inst.address });
                break;
            case 'JumpNotZero':
                result.set(programCounter, { command: 'JumpNotZero', l: getJumpAddress(stmt.inst.arg, labelMap) });
                break;
            case 'Jump':
                result.set(programCounter, { command: 'Jump', l: getJumpAddress(stmt.inst.arg, labelMap) });
                break;
        }
        programCounter++;
    }
    return result;
}
exports.compileProgram = compileProgram;
