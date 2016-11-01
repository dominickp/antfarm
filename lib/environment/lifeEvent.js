"use strict";
/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
var LifeEvent = (function () {
    function LifeEvent(verb, start, finish) {
        var le = this;
        le._date = new Date();
        le._verb = verb;
        le._start = start;
        le._finish = finish;
    }
    Object.defineProperty(LifeEvent.prototype, "date", {
        get: function () {
            return this._date;
        },
        set: function (date) {
            this._date = date;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LifeEvent.prototype, "verb", {
        get: function () {
            return this._verb;
        },
        set: function (verb) {
            this._verb = verb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LifeEvent.prototype, "start", {
        get: function () {
            return this._start;
        },
        set: function (start) {
            this._start = start;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LifeEvent.prototype, "finish", {
        get: function () {
            return this._finish;
        },
        set: function (finish) {
            this._finish = finish;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(LifeEvent.prototype, "statement", {
        get: function () {
            var le = this;
            return le.verb + " from " + le.start + " to " + le.finish;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return LifeEvent;
}());
exports.LifeEvent = LifeEvent;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0g7SUFPSSxtQkFBWSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU07UUFDM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxzQkFBSSwyQkFBSTthQUFSO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQUVELFVBQVMsSUFBVTtZQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBTUQsc0JBQUksMkJBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFTLElBQVk7WUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BSkE7SUFNRCxzQkFBSSw0QkFBSzthQUFUO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDdkIsQ0FBQzthQUVELFVBQVUsS0FBYTtZQUNuQixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUN4QixDQUFDOzs7T0FKQTtJQU1ELHNCQUFJLDZCQUFNO2FBQVY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDO2FBRUQsVUFBVyxNQUFjO1lBQ3JCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQzFCLENBQUM7OztPQUpBO0lBTUQsc0JBQVcsZ0NBQVM7YUFBcEI7WUFDSSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDZCxNQUFNLENBQUksRUFBRSxDQUFDLElBQUksY0FBUyxFQUFFLENBQUMsS0FBSyxZQUFPLEVBQUUsQ0FBQyxNQUFRLENBQUM7UUFDekQsQ0FBQzs7O09BQUE7O0lBRUwsZ0JBQUM7QUFBRCxDQXBEQSxBQW9EQyxJQUFBO0FBcERZLGlCQUFTLFlBb0RyQixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBMaWZlRXZlbnQgY2xhc3MgcHJvdmlkZXMgYSBsaWZlY3ljbGUgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gZGVidWcgam9iIGZhaWx1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgTGlmZUV2ZW50IHtcblxuICAgIHByb3RlY3RlZCBfZGF0ZTogRGF0ZTtcbiAgICBwcm90ZWN0ZWQgX3ZlcmI6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3N0YXJ0OiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9maW5pc2g6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHZlcmIsIHN0YXJ0LCBmaW5pc2gpIHtcbiAgICAgICAgbGV0IGxlID0gdGhpcztcbiAgICAgICAgbGUuX2RhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBsZS5fdmVyYiA9IHZlcmI7XG4gICAgICAgIGxlLl9zdGFydCA9IHN0YXJ0O1xuICAgICAgICBsZS5fZmluaXNoID0gZmluaXNoO1xuICAgIH1cblxuICAgIGdldCBkYXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZTtcbiAgICB9XG5cbiAgICBzZXQgZGF0ZShkYXRlOiBEYXRlKSB7XG4gICAgICAgIHRoaXMuX2RhdGUgPSBkYXRlO1xuICAgIH1cblxuICAgIGdldCB2ZXJiKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmVyYjtcbiAgICB9XG5cbiAgICBzZXQgdmVyYih2ZXJiOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fdmVyYiA9IHZlcmI7XG4gICAgfVxuXG4gICAgZ2V0IHN0YXJ0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3RhcnQ7XG4gICAgfVxuXG4gICAgc2V0IHN0YXJ0KHN0YXJ0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICB9XG5cbiAgICBnZXQgZmluaXNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmluaXNoO1xuICAgIH1cblxuICAgIHNldCBmaW5pc2goZmluaXNoOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZmluaXNoID0gZmluaXNoO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgc3RhdGVtZW50KCkge1xuICAgICAgICBsZXQgbGUgPSB0aGlzO1xuICAgICAgICByZXR1cm4gYCR7bGUudmVyYn0gZnJvbSAke2xlLnN0YXJ0fSB0byAke2xlLmZpbmlzaH1gO1xuICAgIH07XG5cbn0iXX0=
