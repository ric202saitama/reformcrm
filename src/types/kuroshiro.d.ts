// src/types/kuroshiro.d.ts
declare module 'kuroshiro' {
    class Kuroshiro {
        constructor();
        init(analyzer: any): Promise<void>;
        convert(text: string, options: { to: string }): Promise<string>;
    }
    export = Kuroshiro;
}

declare module 'kuroshiro-analyzer-kuromoji' {
    class KuromojiAnalyzer {
        constructor();
    }
    export = KuromojiAnalyzer;
}