import { BrowserTypes } from "./utils/BrowserUtil";

export const WorkerCommand = {
    INITIALIZE: "initialize",
    EXECUTE: "execute",
} as const;
export type WorkerCommand = (typeof WorkerCommand)[keyof typeof WorkerCommand];

export const WorkerResponse = {
    INITIALIZED: "initialized",
    EXECUTED: "EXECUTED",
    POST: "post",
} as const;
export type WorkerResponse = (typeof WorkerResponse)[keyof typeof WorkerResponse];

export type ProcessorConfig = {
    browserType: BrowserTypes;
    onLocal: boolean;
    processorURL: string;
    processorName: string;
    transfer: (Transferable | HTMLCanvasElement)[];
};

export type ProcessorParams = {
    transfer: (Transferable | HTMLCanvasElement)[];
};

export type ProcessorResult = {
    transfer: (Transferable | HTMLCanvasElement)[];
};
