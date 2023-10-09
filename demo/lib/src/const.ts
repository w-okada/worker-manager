import { getBrowserType, ProcessorConfig, ProcessorParams, ProcessorResult } from "@dannadori/worker-manager";

export const LANGS = {
    en: "en",
    ja: "ja",
} as const;
export type LANGS = (typeof LANGS)[keyof typeof LANGS];

export const MessageType = {
    morning: "morning",
    evening: "evening",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const ResultStatus = {
    success: "success",
    fail: "fail",
} as const;
export type ResultStatus = (typeof ResultStatus)[keyof typeof ResultStatus];

export type HelloWorldProcessorConfig = ProcessorConfig & {
    langs: LANGS;
};

export type HelloWorldProcessorParams = ProcessorParams & {
    type: MessageType;
    name: string;
};

export type HelloWorldProcessorResult = ProcessorResult & {
    status: ResultStatus;
};

export const generateConfig = (onLocal = false) => {
    const config: HelloWorldProcessorConfig = {
        browserType: getBrowserType(),
        onLocal: onLocal,
        processorURL: "https://cdn.jsdelivr.net/npm/@dannadori/psdanimator/dist/process.js",
        processorName: "HelloWorldProcessor",
        transfer: [],
        langs: LANGS.ja,
    };
    return config;
};
