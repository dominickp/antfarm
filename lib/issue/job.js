"use strict";
var packedJob_1 = require("./packedJob");
var MyJob = (function () {
    function MyJob(name) {
        this.name = name;
    }
    MyJob.prototype.pack = function () {
        return new packedJob_1.MyPackedJob(this);
    };
    return MyJob;
}());
exports.MyJob = MyJob;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9pc3N1ZS9qb2IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDBCQUEwQixhQUFhLENBQUMsQ0FBQTtBQUV4QztJQUlJLGVBQVksSUFBWTtRQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBRU0sb0JBQUksR0FBWDtRQUNJLE1BQU0sQ0FBQyxJQUFJLHVCQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNMLFlBQUM7QUFBRCxDQVhBLEFBV0MsSUFBQTtBQVhxQixhQUFLLFFBVzFCLENBQUEiLCJmaWxlIjoibGliL2lzc3VlL2pvYi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TXlQYWNrZWRKb2J9IGZyb20gXCIuL3BhY2tlZEpvYlwiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTXlKb2Ige1xuXG4gICAgcHJvdGVjdGVkIG5hbWU6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBwYWNrKCkge1xuICAgICAgICByZXR1cm4gbmV3IE15UGFja2VkSm9iKHRoaXMpO1xuICAgIH1cbn0iXX0=
