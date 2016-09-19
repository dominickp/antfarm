"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var watch = require('node-watch');
var nest_1 = require('./nest');
var Folder = (function (_super) {
    __extends(Folder, _super);
    function Folder() {
        _super.apply(this, arguments);
    }
    /*
    constructor(path: string) {
        //this.path = path;

        //this.watch();
    }
    */
    Folder.prototype.watch = function () {
        watch(this.path, function (filename) {
            console.log(filename, ' changed.');
            // Make a new Job and trigger arrived
            this.arrive();
        });
    };
    Folder.prototype.arrive = function () {
        //super.arrive();
    };
    return Folder;
}(nest_1.Nest));
exports.Folder = Folder;
