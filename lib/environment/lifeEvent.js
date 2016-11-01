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
    Object.defineProperty(LifeEvent.prototype, "statement", {
        get: function () {
            var le = this;
            return le._verb + " from " + le._start + " to " + le._finish;
        },
        enumerable: true,
        configurable: true
    });
    ;
    return LifeEvent;
}());
exports.LifeEvent = LifeEvent;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0g7SUFPSSxtQkFBWSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU07UUFDM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3RCLEVBQUUsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxzQkFBVyxnQ0FBUzthQUFwQjtZQUNJLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztZQUNkLE1BQU0sQ0FBSSxFQUFFLENBQUMsS0FBSyxjQUFTLEVBQUUsQ0FBQyxNQUFNLFlBQU8sRUFBRSxDQUFDLE9BQVMsQ0FBQztRQUM1RCxDQUFDOzs7T0FBQTs7SUFFTCxnQkFBQztBQUFELENBcEJBLEFBb0JDLElBQUE7QUFwQlksaUJBQVMsWUFvQnJCLENBQUEiLCJmaWxlIjoibGliL2Vudmlyb25tZW50L2xpZmVFdmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhlIExpZmVFdmVudCBjbGFzcyBwcm92aWRlcyBhIGxpZmVjeWNsZSB0aGF0IGNhbiBiZSBwcm92aWRlZCB0byBkZWJ1ZyBqb2IgZmFpbHVyZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaWZlRXZlbnQge1xuXG4gICAgcHJvdGVjdGVkIF9kYXRlOiBEYXRlO1xuICAgIHByb3RlY3RlZCBfdmVyYjogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfc3RhcnQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX2ZpbmlzaDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodmVyYiwgc3RhcnQsIGZpbmlzaCkge1xuICAgICAgICBsZXQgbGUgPSB0aGlzO1xuICAgICAgICBsZS5fZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxlLl92ZXJiID0gdmVyYjtcbiAgICAgICAgbGUuX3N0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIGxlLl9maW5pc2ggPSBmaW5pc2g7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBzdGF0ZW1lbnQoKSB7XG4gICAgICAgIGxldCBsZSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBgJHtsZS5fdmVyYn0gZnJvbSAke2xlLl9zdGFydH0gdG8gJHtsZS5fZmluaXNofWA7XG4gICAgfTtcblxufSJdfQ==
