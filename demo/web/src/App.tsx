import React, { useMemo, useState } from "react";
import { generateConfig, HelloWorldProcessorParams, HelloWorldProcessorResult, MessageType, WorkerManager } from "@dannadori/worker-manager-demo-lib";
export const App = () => {
    const [mess, setMess] = useState<string>("");
    const wm = useMemo(() => {
        const config = generateConfig();
        config.processorURL = "https://localhost:8080/process.js"; // 注意：絶対パスでないと動かせない。
        const wm = new WorkerManager();
        wm.init(config).then(async () => {
            const params: HelloWorldProcessorParams = {
                type: MessageType.morning,
                name: "Dannadori",
                transfer: [new Uint8Array([1, 2, 3, 4, 5]).buffer],
            };
            const res = (await wm.execute(params)) as HelloWorldProcessorResult;
            console.log(res);
        });
        return wm;
    }, []);

    return <>aaaa Ape</>;
};
