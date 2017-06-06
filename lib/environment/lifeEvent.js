"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7R0FFRztBQUNIO0lBT0ksbUJBQVksSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNO1FBQzNCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN0QixFQUFFLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNoQixFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNsQixFQUFFLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUN4QixDQUFDO0lBRUQsc0JBQUksMkJBQUk7YUFBUjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFTLElBQVU7WUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FKQTtJQU1ELHNCQUFJLDJCQUFJO2FBQVI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBUyxJQUFZO1lBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBTUQsc0JBQUksNEJBQUs7YUFBVDtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7YUFFRCxVQUFVLEtBQWE7WUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDeEIsQ0FBQzs7O09BSkE7SUFNRCxzQkFBSSw2QkFBTTthQUFWO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQzthQUVELFVBQVcsTUFBYztZQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztRQUMxQixDQUFDOzs7T0FKQTtJQU1ELHNCQUFXLGdDQUFTO2FBQXBCO1lBQ0ksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQ2QsTUFBTSxDQUFJLEVBQUUsQ0FBQyxJQUFJLGNBQVMsRUFBRSxDQUFDLEtBQUssWUFBTyxFQUFFLENBQUMsTUFBUSxDQUFDO1FBQ3pELENBQUM7OztPQUFBO0lBQUEsQ0FBQztJQUVOLGdCQUFDO0FBQUQsQ0FwREEsQUFvREMsSUFBQTtBQXBEWSw4QkFBUyIsImZpbGUiOiJsaWIvZW52aXJvbm1lbnQvbGlmZUV2ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoZSBMaWZlRXZlbnQgY2xhc3MgcHJvdmlkZXMgYSBsaWZlY3ljbGUgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gZGVidWcgam9iIGZhaWx1cmVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExpZmVFdmVudCB7XHJcblxyXG4gICAgcHJvdGVjdGVkIF9kYXRlOiBEYXRlO1xyXG4gICAgcHJvdGVjdGVkIF92ZXJiOiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX3N0YXJ0OiBzdHJpbmc7XHJcbiAgICBwcm90ZWN0ZWQgX2ZpbmlzaDogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHZlcmIsIHN0YXJ0LCBmaW5pc2gpIHtcclxuICAgICAgICBsZXQgbGUgPSB0aGlzO1xyXG4gICAgICAgIGxlLl9kYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBsZS5fdmVyYiA9IHZlcmI7XHJcbiAgICAgICAgbGUuX3N0YXJ0ID0gc3RhcnQ7XHJcbiAgICAgICAgbGUuX2ZpbmlzaCA9IGZpbmlzaDtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZGF0ZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgZGF0ZShkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fZGF0ZSA9IGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZlcmIoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZlcmI7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZlcmIodmVyYjogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fdmVyYiA9IHZlcmI7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHN0YXJ0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc3RhcnQoc3RhcnQ6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3N0YXJ0ID0gc3RhcnQ7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IGZpbmlzaCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmluaXNoO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBmaW5pc2goZmluaXNoOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9maW5pc2ggPSBmaW5pc2g7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBzdGF0ZW1lbnQoKSB7XHJcbiAgICAgICAgbGV0IGxlID0gdGhpcztcclxuICAgICAgICByZXR1cm4gYCR7bGUudmVyYn0gZnJvbSAke2xlLnN0YXJ0fSB0byAke2xlLmZpbmlzaH1gO1xyXG4gICAgfTtcclxuXHJcbn0iXX0=
