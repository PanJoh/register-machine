"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Executor = void 0;
const machine_1 = require("./machine");
class Executor {
    program;
    constructor(program) {
        this.program = program;
    }
    execute(args) {
        const machine = new machine_1.RegisterMachine(args);
        let instruction = this.getInstruction(machine);
        while (instruction.command !== 'Halt') {
            switch (instruction.command) {
                case 'LoadConst':
                    machine.loadConst(instruction.value);
                    break;
                case 'Load':
                    machine.load(instruction.i);
                    break;
                case 'Add':
                    machine.add(instruction.i);
                    break;
                case 'Sub':
                    machine.sub(instruction.i);
                    break;
                case 'Jump':
                    machine.jump(instruction.l);
                    break;
                case 'JumpNotZero':
                    machine.jumpNotZero(instruction.l);
                    break;
                case 'Store':
                    machine.store(instruction.i);
                    break;
            }
            instruction = this.getInstruction(machine);
        }
        return machine.registers;
    }
    getInstruction(machine) {
        return this.program.get(machine.ProgramCounter) ?? { command: 'Halt' };
    }
}
exports.Executor = Executor;
