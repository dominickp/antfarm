"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("util");
var JobProperty = (function () {
    function JobProperty(key, value) {
        var jp = this;
        jp.key = key;
        jp.value = value;
    }
    Object.defineProperty(JobProperty.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (value) {
            this._value = value;
            this.resolveType();
        },
        enumerable: true,
        configurable: true
    });
    JobProperty.prototype.resolveType = function () {
        var jp = this;
        var type = typeof (jp.value);
        if (util_1.isArray(jp.value)) {
            jp.type = "array";
        }
        else {
            jp.type = type;
        }
    };
    Object.defineProperty(JobProperty.prototype, "key", {
        get: function () {
            return this._key;
        },
        set: function (key) {
            this._key = key;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobProperty.prototype, "type", {
        get: function () {
            return this._type;
        },
        set: function (type) {
            this._type = type;
        },
        enumerable: true,
        configurable: true
    });
    return JobProperty;
}());
exports.JobProperty = JobProperty;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivam9iUHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNkI7QUFFN0I7SUFNSSxxQkFBWSxHQUFXLEVBQUUsS0FBVTtRQUMvQixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNiLEVBQUUsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFFRCxzQkFBVyw4QkFBSzthQUFoQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7YUFFRCxVQUFpQixLQUFVO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2QixDQUFDOzs7T0FMQTtJQU9TLGlDQUFXLEdBQXJCO1FBQ0ksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsSUFBSSxJQUFJLEdBQUcsT0FBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixFQUFFLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUN0QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFXLDRCQUFHO2FBQWQ7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUNyQixDQUFDO2FBRUQsVUFBZSxHQUFXO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLENBQUM7OztPQUpBO0lBTUQsc0JBQVcsNkJBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBS0wsa0JBQUM7QUFBRCxDQTlDQSxBQThDQyxJQUFBO0FBOUNZLGtDQUFXIiwiZmlsZSI6ImxpYi9qb2Ivam9iUHJvcGVydHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQXJyYXl9IGZyb20gXCJ1dGlsXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgSm9iUHJvcGVydHkge1xyXG5cclxuICAgIHByb3RlY3RlZCBfa2V5OiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX3ZhbHVlOiBhbnk7XHJcbiAgICBwcm90ZWN0ZWQgX3R5cGU6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihrZXk6IHN0cmluZywgdmFsdWU6IGFueSkge1xyXG4gICAgICAgIGxldCBqcCA9IHRoaXM7XHJcbiAgICAgICAganAua2V5ID0ga2V5O1xyXG4gICAgICAgIGpwLnZhbHVlID0gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB2YWx1ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCB2YWx1ZSh2YWx1ZTogYW55KSB7XHJcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnJlc29sdmVUeXBlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJvdGVjdGVkIHJlc29sdmVUeXBlKCkge1xyXG4gICAgICAgIGxldCBqcCA9IHRoaXM7XHJcbiAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YoanAudmFsdWUpO1xyXG4gICAgICAgIGlmIChpc0FycmF5KGpwLnZhbHVlKSkge1xyXG4gICAgICAgICAgICBqcC50eXBlID0gXCJhcnJheVwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGpwLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGtleSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQga2V5KGtleTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgdHlwZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdHlwZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHR5cGUodHlwZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fdHlwZSA9IHR5cGU7XHJcbiAgICB9XHJcbn0iXX0=
