export interface LoadConst {
    command: 'LoadConst';
    value: bigint;
}

export interface Load {
    command: 'Load';
    i: bigint;
}

export interface Store {
    command: 'Store';
    i: bigint;
}

export interface Add {
    command: 'Add';
    i: bigint;
}

export interface Sub {
    command: 'Sub';
    i: bigint;
}

export interface Jump {
    command: 'Jump';
    l: bigint;
}

export interface JumpNotZero {
    command: 'JumpNotZero';
    l: bigint;
}

export interface Halt {
    command: 'Halt';
}

export type Instruction = LoadConst | Load | Store | Add | Sub | Jump | JumpNotZero | Halt;



