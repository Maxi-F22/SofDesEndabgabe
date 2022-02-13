import { Answers } from 'prompts';

class ConsoleHandler {
    private static _instance: ConsoleHandler = new ConsoleHandler();

    private _prompts: any = require('prompts');

    constructor() {
        if (ConsoleHandler._instance)
            throw new Error("Use ConsoleHandler.getInstance() instead new ConsoleHandler()")
        ConsoleHandler._instance = this
    }

    public static getInstance(): ConsoleHandler {
        return ConsoleHandler._instance
    }

    public async question(question: string): Promise<Answers<string>> {
        return this._prompts({
            type: 'text',
            name: 'answer',
            message: question,
        });
    }

    public async numberQuestion(question: string, initial: number = 0, min?: number, max?: number): Promise<Answers<string>> {
        return this._prompts({
            type: 'number',
            name: 'answer',
            message: question,
            initial: initial,
            min: min ? min : -Infinity,
            max: max? max : Infinity
        });
    }

    public async dateQuestion(question: string, initial: Date): Promise<Answers<string>> {
        return this._prompts({
            type: 'date',
            name: 'answer',
            message: question,
            mask: "DD.MM.YYYY",
            initial: initial
        });
    }

    public async booleanQuestion(message: string): Promise<Answers<string>> {
        return this._prompts({
            type: 'toggle',
            name: 'answer',
            message: message,
            initial: false,
            active: "Ja",
            inactive: "Nein"
        });
    }

    public async autoQuestion(message: string, choices: Object[]): Promise<Answers<string>> {
        const suggestFunction = (input: string, choices: [{title: string}]) => Promise.resolve(choices.filter(i => i.title.toLowerCase().includes(input.toLowerCase())))
        
        return this._prompts({
            type: 'autocomplete',
            name: 'selected',
            message: message,
            choices: choices,
            limit: 10,
            suggest: suggestFunction,
        });
    }

    public async select(message: string, choices: Object[]): Promise<Answers<string>> {
        return this._prompts({
            type: 'select',
            name: 'selected',
            message: message,
            choices: choices,
            hint: "Mit Pfeiltasten navigieren und mit Enter betätigen",
            initial: 0
        });
    }

    public async multiselect(message: string, hint: string, choices: Object[]): Promise<Answers<string>> {
        return this._prompts({
            type: 'multiselect',
            name: 'selected',
            message: message,
            choices: choices,
            hint: hint,
            instructions: ""
        });
    }

    public print(input: string, breakcount: number, red?: boolean) {
        if (red) {
            process.stdout.write("\x1b[91m" + input + "\x1b[29m");
            console.log("\x1b[0m");
        }
        else{
            process.stdout.write(input);
        }
        let breaks: string = "";
        for (let i: number = 0; i < breakcount; i++) {
            breaks += "\n";
        }
        process.stdout.write(breaks);
    }
}

export default ConsoleHandler.getInstance();