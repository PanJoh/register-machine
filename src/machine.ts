export class RegisterFile {
    private registers = new Map<bigint, bigint>();

    get(i: bigint): bigint {
        return this.registers.get(i) ?? 0n;
    }

    set(i: bigint, value: bigint) {
        this.registers.set(i, value);
    }

    get Registers() {
        return new Map(this.registers);
    }
}

export class RegisterMachine {
    registers = new RegisterFile();
    programCounter = 0n;

    constructor(initialValues: bigint[]) {
        for (const [index, value] of initialValues.entries()) {
            this.registers.set(BigInt(index), value);
        }
    }

    loadConst(value: bigint) {
        this.registers.set(0n, value);
        this.programCounter++;
    }

    load(i: bigint) {
        this.registers.set(0n, this.registers.get(i));
        this.programCounter++;
    }

    store(i: bigint) {
        this.registers.set(i, this.registers.get(0n));
        this.programCounter++;
    }

    add(i: bigint) {
        this.registers.set(0n, this.registers.get(0n) + this.registers.get(i));
        this.programCounter++;
    }

    sub(i: bigint) {
        this.registers.set(0n, this.registers.get(0n) - this.registers.get(i));
        this.programCounter++;
    }

    jump(l: bigint) {
        this.programCounter = l;
    }

    jumpNotZero(l: bigint) {
        if (this.registers.get(0n) !== 0n) {
            this.programCounter = l;
        } else {
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