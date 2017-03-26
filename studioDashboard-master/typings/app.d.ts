/**
 * Declarations angular depends on for compilation to ES6.
 * This file is also used to propagate our transitive typings
 * to users.
 */


// <reference path="../typings/hammerjs/hammerjs.d.ts"/>
// <reference path="../typings/jasmine/jasmine.d.ts"/>
// <reference path="../typings/angular-protractor/angular-protractor.d.ts"/>
// <reference path="../typings/node/node.d.ts" />
// <reference path="../typings/es6-shim/es6-shim.d.ts" />
// <reference path="../typings/zone.js/zone.js.d.ts"/>

///<reference path="../typings/stringjs/string.d.ts" />
///<reference path="../typings/jquery/jquery.d.ts" />
/// <reference path='../node_modules/ng-mslib/typings/app.d.ts'/>
///<reference path="../typings/browser/ambient/systemjs/systemjs.d.ts" />
///<reference path="../typings/browser/ambient/es6-shim/es6-shim.d.ts" />
//<reference path="../typings/browser/ambient/require/require.d.ts" />
///<reference path="../typings/browser/ambient/redux/redux.d.ts" />
///<reference path="../typings/browser/ambient/redux-thunk/redux-thunk.d.ts" />
///<reference path="../typings/browser/ambient/reselect/reselect.d.ts" />
///<reference path="../typings/bootbox/bootbox.d.ts" />
///<reference path="../typings/lodash/index.d.ts" />
///<reference path="../typings/moment/moment-node.d.ts" />
///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>

declare var assert: any;
// declare var module:any;
declare var thunkMiddleware: any;

declare module '*!text' {
    var _: string;
    export default  _;
}

// declare module '*!css' {
//     var _: string;
//     export default  _;
// }
//
// declare module '*!' {
//     var _: string;
//     export default  _;
// }


// declare var Symbol: {
//     (description?: anyNotSymbol): symbol;
//     readonly match: symbol;
// };


declare module "*.json" {
    const value: any;
    export default value;
}

declare module Reflect {
    function apply(target: Function, thisArgument: any, argumentsList: ArrayLike<any>): any;

    function construct(target: Function, argumentsList: ArrayLike<any>): any;

    function getMetadata(annotations: string, constructor: any): any;

    function defineProperty(target: any, propertyKey: PropertyKey, attributes: PropertyDescriptor): boolean;

    function deleteProperty(target: any, propertyKey: PropertyKey): boolean;

    function enumerate(target: any): IterableIteratorShim<any>;

    function get(target: any, propertyKey: PropertyKey, receiver?: any): any;

    function getOwnPropertyDescriptor(target: any, propertyKey: PropertyKey): PropertyDescriptor;

    function getPrototypeOf(target: any): any;

    function has(target: any, propertyKey: PropertyKey): boolean;

    function isExtensible(target: any): boolean;

    function ownKeys(target: any): Array<PropertyKey>;

    function preventExtensions(target: any): boolean;

    function set(target: any, propertyKey: PropertyKey, value: any, receiver?: any): boolean;

    function setPrototypeOf(target: any, proto: any): boolean;
}


interface Window {
    devToolsExtension: any;
    devToolsExtensionDisabled: any;
    DOMParser: any;
}

/**
 * ES6 shims taken from /typings/browser/ambient/es6-shim
 */
interface ObjectConstructor {
    assign(target: any, ...sources: any[]): any;
}
// interface ArrayConstructor {
//     from:any;
// }
interface String {
    repeat(count: number): string;
}

declare module 'highcharts/highstock' {
    var Ng2Highcharts: any
}

declare module 'highcharts/modules/map' {

}

declare module 'highcharts' {
}

declare module 'xml2js' {
    var parseString;
}

declare module 'platform' {
    var name;
}

declare var watch: any;

declare var __moduleName: string;

// in TS1.8 we can use this:
//declare global {
//    devToolsExtension: any;
//    devToolsExtensionDisabled: any;
//    devToolsExtensionDisabled Array<T> {
//}


