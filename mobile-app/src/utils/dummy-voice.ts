// Dummy implementation of expo-voice for development
const Voice = {
  start: async (locale?: string): Promise<any> => Promise.resolve({}),
  stop: async (): Promise<any> => Promise.resolve({}),
  cancel: async (): Promise<any> => Promise.resolve({}),
  destroy: async (): Promise<any> => Promise.resolve({}),
  isAvailable: async (): Promise<boolean> => Promise.resolve(false),
  isRecognizing: async (): Promise<boolean> => Promise.resolve(false),
  addListener: (event: string, callback: Function): any => ({ remove: () => {} }),
  removeAllListeners: (event: string): void => {},
  getSpeechRecognitionServices: async (): Promise<string[]> => Promise.resolve([]),
};

// Event types
export interface SpeechErrorEvent {
  error?: {
    message: string;
    code: string;
  };
}

export interface SpeechResultsEvent {
  value?: string[];
}

export interface SpeechStartEvent {
  error?: boolean;
}

export interface SpeechEndEvent {
  error?: boolean;
}

export interface SpeechVolumeChangeEvent {
  value?: number;
}

export default Voice;
