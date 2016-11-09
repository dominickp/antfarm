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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQTs7R0FFRztBQUNIO0lBQUE7SUErREEsQ0FBQztJQXpDRyxzQkFBVyx5QkFBTzthQUlsQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ3pCLENBQUM7YUFORCxVQUFtQixPQUFlO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsMEJBQVE7YUFJbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO2FBTkQsVUFBb0IsUUFBOEQ7WUFDOUUsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDOUIsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyxzQkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQUVELFVBQWdCLElBQVk7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BSkE7SUFVRCxzQkFBVywwQkFBUTthQVVuQjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzFCLENBQUM7UUFoQkQ7OztXQUdHO2FBQ0gsVUFBb0IsUUFBaUI7WUFDakMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2IsRUFBRSxDQUFDLENBQUMsUUFBUSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNuQixDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNyQixDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osQ0FBQyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDeEIsQ0FBQztRQUNMLENBQUM7OztPQUFBO0lBS0wsV0FBQztBQUFELENBL0RBLEFBK0RDLElBQUE7QUEvRFksWUFBSSxPQStEaEIsQ0FBQSIsImZpbGUiOiJsaWIvdWkvc3RlcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Sm9ifSBmcm9tIFwiLi4vam9iL2pvYlwiO1xuaW1wb3J0IHtXZWJob29rSW50ZXJmYWNlfSBmcm9tIFwiLi93ZWJob29rSW50ZXJmYWNlXCI7XG4vKipcbiAqIEFuIGludGVyZmFjZSBzdGVwIHdoaWNoIGFsbG93cyBHRVQgcmVxdWVzdHMgdG8gYmUgbWFkZSBhZ2FpbnN0IHRoZSBpbnRlcmZhY2UgaXRzZWxmLlxuICovXG5leHBvcnQgY2xhc3MgU3RlcCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaHVtYW4tcmVhZGFibGUgc3RlcCBfbmFtZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEZsYWcgaWYgc3RlcCBpcyBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NvbXBsZXRlOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZnVuY3Rpb24gdG8gcnVuIG9uIHN0ZXAgZXhlY3V0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY2FsbGJhY2s6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFN0ZXAgdmFsaWRhdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2ZhaWx1cmU6IHN0cmluZztcblxuICAgIHB1YmxpYyBzZXQgZmFpbHVyZShtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZmFpbHVyZSA9IG1lc3NhZ2U7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBmYWlsdXJlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmFpbHVyZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IGNhbGxiYWNrKGNhbGxiYWNrOiAoam9iOiBKb2IsIHVpOiBXZWJob29rSW50ZXJmYWNlLCBzdGVwOiBTdGVwKSA9PiB2b2lkKSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBjYWxsYmFjaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29tcGxldGUgYW5kIHdpcGUgb3V0IGFueSBmYWlsdXJlXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBjb21wbGV0ZShjb21wbGV0ZTogYm9vbGVhbikge1xuICAgICAgICBsZXQgcyA9IHRoaXM7XG4gICAgICAgIGlmIChjb21wbGV0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcy5fY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgcy5mYWlsdXJlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMuX2NvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGNvbXBsZXRlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29tcGxldGU7XG4gICAgfVxufSJdfQ==
