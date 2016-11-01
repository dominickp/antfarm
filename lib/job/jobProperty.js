"use strict";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9qb2Ivam9iUHJvcGVydHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFzQixNQUFNLENBQUMsQ0FBQTtBQUU3QjtJQU1JLHFCQUFZLEdBQVcsRUFBRSxLQUFVO1FBQy9CLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2IsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQUVELHNCQUFXLDhCQUFLO2FBQWhCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzthQUVELFVBQWlCLEtBQVU7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDcEIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7OztPQUxBO0lBT1MsaUNBQVcsR0FBckI7UUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDZCxJQUFJLElBQUksR0FBRyxPQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBRUQsc0JBQVcsNEJBQUc7YUFBZDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLENBQUM7YUFFRCxVQUFlLEdBQVc7WUFDdEIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BSkE7SUFNRCxzQkFBVyw2QkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQUVELFVBQWdCLElBQVk7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BSkE7SUFLTCxrQkFBQztBQUFELENBOUNBLEFBOENDLElBQUE7QUE5Q1ksbUJBQVcsY0E4Q3ZCLENBQUEiLCJmaWxlIjoibGliL2pvYi9qb2JQcm9wZXJ0eS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNBcnJheX0gZnJvbSBcInV0aWxcIjtcblxuZXhwb3J0IGNsYXNzIEpvYlByb3BlcnR5IHtcblxuICAgIHByb3RlY3RlZCBfa2V5OiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF92YWx1ZTogYW55O1xuICAgIHByb3RlY3RlZCBfdHlwZTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Ioa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgbGV0IGpwID0gdGhpcztcbiAgICAgICAganAua2V5ID0ga2V5O1xuICAgICAgICBqcC52YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHZhbHVlKHZhbHVlOiBhbnkpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5yZXNvbHZlVHlwZSgpO1xuICAgIH1cblxuICAgIHByb3RlY3RlZCByZXNvbHZlVHlwZSgpIHtcbiAgICAgICAgbGV0IGpwID0gdGhpcztcbiAgICAgICAgbGV0IHR5cGUgPSB0eXBlb2YoanAudmFsdWUpO1xuICAgICAgICBpZiAoaXNBcnJheShqcC52YWx1ZSkpIHtcbiAgICAgICAgICAgIGpwLnR5cGUgPSBcImFycmF5XCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBqcC50eXBlID0gdHlwZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQga2V5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fa2V5O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQga2V5KGtleTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2tleSA9IGtleTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90eXBlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgdHlwZSh0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fdHlwZSA9IHR5cGU7XG4gICAgfVxufSJdfQ==
