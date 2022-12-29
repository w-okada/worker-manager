import { WorkerCommand, WorkerResponse, ProcessorParams, ProcessorConfig } from "./const";
import { Processor } from "./Processor";

const ctx: Worker = self as any; // eslint-disable-line no-restricted-globals
let config: ProcessorConfig | null = null;
let processor: Processor | null = null

const responseError = (errorMessage: string) => {
    ctx.postMessage({
        message: WorkerResponse.EXECUTED,
        data: ["error", errorMessage],
    });
}

onmessage = async (event) => {
    if (event.data.message === WorkerCommand.INITIALIZE) {
        config = event.data.config as ProcessorConfig;
        // console.log("config", config)
        importScripts(config.processorURL)
        // console.log("self", self, global)
        //@ts-ignore
        processor = new self[config.processorName](config) as Processor
        // console.log("processor", processor)
        ctx.postMessage({ message: WorkerResponse.INITIALIZED });
    } else if (event.data.message === WorkerCommand.EXECUTE) {
        if (!config || !processor) {
            responseError(`${config?.processorName || "Config or Processor"} is not initialized.`)
            return
        }
        const params: ProcessorParams = event.data.params;
        const result = processor.process(params)

        ctx.postMessage({
            message: WorkerResponse.EXECUTED,
            data: result,
        }, result.transfer as Transferable[]);
    } else {
        console.log("not implemented");
    }
};

