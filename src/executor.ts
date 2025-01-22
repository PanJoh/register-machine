import { RegisterMachine } from "./machine";
import { Instruction } from "./program";

export class Executor {
    constructor(private program: Map<bigint, Instruction>) {}

    execute(args: bigint[]) {
        const machine = new RegisterMachine(args);

        let instruction = this.getInstruction(machine);

        while(instruction.command !== 'Halt') {
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

    private getInstruction(machine: RegisterMachine) {
        return this.program.get(machine.ProgramCounter) ?? { command: 'Halt'};
    }
}