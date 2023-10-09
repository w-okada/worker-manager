import { HelloWorldProcessorConfig, HelloWorldProcessorParams, HelloWorldProcessorResult, LANGS, MessageType } from "./const";
import { Processor, ProcessorConfig, ProcessorParams, ProcessorResult } from "@dannadori/worker-manager";

export class HelloWorldProcessor extends Processor {
    config: HelloWorldProcessorConfig;
    constructor(_config: ProcessorConfig) {
        super();
        this.config = _config as HelloWorldProcessorConfig;
    }

    _errorResult = (detail: string): HelloWorldProcessorResult => {
        return {
            status: "fail",
            transfer: [],
        };
    };
    process = (_params: ProcessorParams): HelloWorldProcessorResult => {
        const params = _params as HelloWorldProcessorParams;
        // console.log(`PSDAnimatorParams:`, params)

        switch (params.type) {
            case MessageType.morning:
                console.log(`${this.config.langs == LANGS.ja ? "おはよう" : "GOOD MORINING!!!"} ${params.name}`);
                break;
            case MessageType.evening:
                console.log(`${this.config.langs == LANGS.ja ? "こんばんわ" : "GOOD EVENING"} ${params.name}`);
                break;
            default:
                return this._errorResult(`UNKNOWN FUNCTION: ${params.type}`);
        }
        const u8Array = new Uint8Array(params.transfer[0] as ArrayBufferLike);
        console.log(`DATA:::`, u8Array);

        return {
            status: "success",
            transfer: [],
        };
    };
}
