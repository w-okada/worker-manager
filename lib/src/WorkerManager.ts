import { ProcessorParams, ProcessorConfig, WorkerCommand, WorkerResponse, ProcessorResult } from "./const";
import { BlockingQueue } from "./utils/BlockingQueue";
import { Processor } from "./Processor";

// @ts-ignore
import workerJs from "worker-loader?inline=no-fallback!./Worker.ts";

const importExternal = (url: string) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        // @ts-ignore
        script.onload = () => resolve(window['external_global_component']);
        script.onerror = reject;

        document.body.appendChild(script);
    });
}

// Convert HTMLCanvasElement to OffscreenCanvas
const convertObjectForTransfer = (input: ProcessorConfig | ProcessorParams) => {
    const replacedTranser = input.transfer.map(x => {
        if (x instanceof HTMLCanvasElement) {
            const offScreenCanvas = x.transferControlToOffscreen();
            for (const prop in input) {
                //@ts-ignore
                if (input[prop] == x) {
                    //@ts-ignore
                    input[prop] = offScreenCanvas
                }
            }
            return offScreenCanvas
        }
        return x
    })
    input.transfer = replacedTranser
}


export class WorkerManager {
    private worker: Worker | null = null;
    private processor: Processor | null = null

    private config: ProcessorConfig | null = null;
    private sem = new BlockingQueue<number>();

    constructor() {
        this.sem.enqueue(0);
    }
    private lock = async () => {
        const num = await this.sem.dequeue();
        return num;
    };
    private unlock = (num: number) => {
        this.sem.enqueue(num + 1);
    };

    init = async (config: ProcessorConfig) => {

        const lockNum = await this.lock()
        this.config = config
        if (this.worker) {
            this.worker.terminate();
        }
        this.worker = null;

        if (config.browserType == "SAFARI" || config.onLocal == true) {
            await importExternal(config.processorURL)
            // @ts-ignore
            this.processor = new global[config.processorName](config.psdFile, config.canvas, config.maxWidth, config.maxHeight)
            console.log("[WorkerManager] Processor work on local")
        } else {
            const newWorker: Worker = workerJs();
            const p = new Promise<void>((resolve, reject) => {
                newWorker.onmessage = (event) => {
                    if (event.data.message === WorkerResponse.INITIALIZED) {
                        this.worker = newWorker;
                        resolve();
                    } else {
                        console.warn("Initialization something wrong..");
                        reject();
                    }
                };

                convertObjectForTransfer(config)

                newWorker.postMessage({
                    message: WorkerCommand.INITIALIZE,
                    config: config,
                }, config.transfer as Transferable[]);
            });
            await p
            console.log("[WorkerManager] Processor work on Worker")
        }
        await this.unlock(lockNum)
        return;
    };

    execute = async (params: ProcessorParams) => {
        if (this.sem.length > 100) {
            throw new Error(`queue is fulled: ${this.sem.length}`);
        }

        if (!this.config) {
            throw new Error("no config.");
        }


        const lockNum = await this.lock();
        try {
            if (this.config.browserType == "SAFARI" || this.config.onLocal == true) {
                if (!this.processor) {
                    throw new Error("processor is not activated.");
                }
                return this.processor.process(params)

            } else {
                const p = new Promise<ProcessorResult>((resolve, reject) => {
                    if (!this.worker) {
                        reject("worker is not activated. 2");
                        return
                    }
                    this.worker.onmessage = (event) => {
                        if (event.data.message === WorkerResponse.EXECUTED) {
                            resolve(event.data.data as ProcessorResult);
                        } else {
                            console.error("Execute is panic: unknwon message", event.data.message);
                            reject(event);
                        }
                    };

                    convertObjectForTransfer(params)

                    this.worker.postMessage(
                        {
                            message: WorkerCommand.EXECUTE,
                            params: params,
                        },
                        params.transfer as Transferable[]
                    );
                })
                const c = await p
                console.log("worker response:", c)
                return c
            }
        } catch (exception) {
            throw (exception)
        } finally {
            this.unlock(lockNum);
        }
    }
}