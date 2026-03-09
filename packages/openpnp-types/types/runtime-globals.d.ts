/// <reference path="./generated/openpnp-java.d.ts" />

declare function print(...args: any[]): void;
declare function load(path: string): void;
declare const Packages: any;

interface JavaImporterConstructor {
    <P1 extends object>(p1: P1): P1;
    <P1 extends object>(p1: P1, ...rest: any[]): P1;
    <P1 extends object, P2 extends object>(p1: P1, p2: P2): P1 & P2;
    <P1 extends object, P2 extends object>(p1: P1, p2: P2, ...rest: any[]): P1 & P2;
    new <P1 extends object>(p1: P1): P1;
    new <P1 extends object>(p1: P1, ...rest: any[]): P1;
    new <P1 extends object, P2 extends object>(p1: P1, p2: P2): P1 & P2;
    new <P1 extends object, P2 extends object>(p1: P1, p2: P2, ...rest: any[]): P1 & P2;
}

declare const JavaImporter: JavaImporterConstructor;

declare namespace Java {
    function type<K extends keyof OpenPnpJavaTypeMap>(name: K): OpenPnpJavaTypeMap[K];
    function type<T = any>(name: string): T;
}

declare const config: org.openpnp.model.Configuration;
declare const machine: org.openpnp.spi.Machine;
declare const gui: org.openpnp.gui.MainFrame;
declare const scripting: org.openpnp.scripting.Scripting;

declare const javax: {
    swing: {
        JOptionPane: {
            showMessageDialog(parentComponent: any | null, message: string): void;
        };
    };
    script: {
        ScriptEngineManager: {
            new (): {
                getEngineFactories(): java.util.List<{
                    getEngineName(): string;
                    getEngineVersion(): string;
                    getLanguageName(): string;
                    getLanguageVersion(): string;
                    getExtensions(): java.util.List<string>;
                }>;
            };
        };
    };
};

declare namespace java.util {
    interface List<T> {
        size(): number;
        get(index: number): T;
    }
}
