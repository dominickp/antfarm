"use strict";
/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
var Step = (function () {
    function Step() {
    }
    Object.defineProperty(Step.prototype, "failure", {
        get: function () {
            return this._failure;
        },
        set: function (message) {
            this._failure = message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "callback", {
        get: function () {
            return this._callback;
        },
        set: function (callback) {
            this._callback = callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "complete", {
        get: function () {
            return this._complete;
        },
        /**
         * Set complete and wipe out any failure
         * @param complete
         */
        set: function (complete) {
            var s = this;
            if (complete === true) {
                s._complete = true;
                s.failure = null;
            }
            else {
                s._complete = false;
            }
        },
        enumerable: true,
        configurable: true
    });
    return Step;
}());
exports.Step = Step;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNIO0lBQUE7SUErREEsQ0FBQztJQXpDRyxzQkFBVyx5QkFBTzthQUlsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFORCxVQUFtQixPQUFlO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsMEJBQVE7YUFJbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO2FBTkQsVUFBb0IsUUFBYTtZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLHNCQUFJO2FBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBZ0IsSUFBWTtZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FKQTtJQVVELHNCQUFXLDBCQUFRO2FBVW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQztRQWhCRDs7O1dBR0c7YUFDSCxVQUFvQixRQUFpQjtZQUNqQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDYixFQUFFLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDcEIsQ0FBQyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7Z0JBQ25CLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3JCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN4QixDQUFDO1FBQ0wsQ0FBQzs7O09BQUE7SUFLTCxXQUFDO0FBQUQsQ0EvREEsQUErREMsSUFBQTtBQS9EWSxZQUFJLE9BK0RoQixDQUFBIiwiZmlsZSI6ImxpYi91aS9zdGVwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBbiBpbnRlcmZhY2Ugc3RlcCB3aGljaCBhbGxvd3MgR0VUIHJlcXVlc3RzIHRvIGJlIG1hZGUgYWdhaW5zdCB0aGUgaW50ZXJmYWNlIGl0c2VsZi5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0ZXAge1xuXG4gICAgLyoqXG4gICAgICogVGhlIGh1bWFuLXJlYWRhYmxlIHN0ZXAgX25hbWUuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBGbGFnIGlmIHN0ZXAgaXMgY29tcGxldGUgb3Igbm90XG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9jb21wbGV0ZTogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIENhbGxiYWNrIGZ1bmN0aW9uIHRvIHJ1biBvbiBzdGVwIGV4ZWN1dGlvbi5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NhbGxiYWNrOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBTdGVwIHZhbGlkYXRpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIF9mYWlsdXJlOiBzdHJpbmc7XG5cbiAgICBwdWJsaWMgc2V0IGZhaWx1cmUobWVzc2FnZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuX2ZhaWx1cmUgPSBtZXNzYWdlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgZmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZhaWx1cmU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBjYWxsYmFjayhjYWxsYmFjazogYW55KSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29tcGxldGUgYW5kIHdpcGUgb3V0IGFueSBmYWlsdXJlXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBjb21wbGV0ZShjb21wbGV0ZTogYm9vbGVhbikge1xuICAgICAgICBsZXQgcyA9IHRoaXM7XG4gICAgICAgIGlmIChjb21wbGV0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcy5fY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgcy5mYWlsdXJlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMuX2NvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcGxldGU7XG4gICAgfVxufSJdfQ==
