import { ProcessorParams, ProcessorResult } from "./const";

export abstract class Processor {
    abstract process: (params: ProcessorParams) => ProcessorResult
}
