"use strict";
/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
var Step = (function () {
    function Step() {
    }
    Object.defineProperty(Step.prototype, "failure", {
        set: function (message) {
            this._failure = message;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "callback", {
        set: function (callback) {
            this._callback = callback;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "name", {
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Step.prototype, "complete", {
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNIO0lBQUE7SUErQ0EsQ0FBQztJQXpCRyxzQkFBVyx5QkFBTzthQUFsQixVQUFtQixPQUFlO1lBQzlCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsMEJBQVE7YUFBbkIsVUFBb0IsUUFBYTtZQUM3QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUM5QixDQUFDOzs7T0FBQTtJQUVELHNCQUFXLHNCQUFJO2FBQWYsVUFBZ0IsSUFBWTtZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLDBCQUFRO1FBSm5COzs7V0FHRzthQUNILFVBQW9CLFFBQWlCO1lBQ2pDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNiLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDckIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLENBQUM7UUFDTCxDQUFDOzs7T0FBQTtJQUNMLFdBQUM7QUFBRCxDQS9DQSxBQStDQyxJQUFBO0FBL0NZLFlBQUksT0ErQ2hCLENBQUEiLCJmaWxlIjoibGliL3VpL3N0ZXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEFuIGludGVyZmFjZSBzdGVwIHdoaWNoIGFsbG93cyBHRVQgcmVxdWVzdHMgdG8gYmUgbWFkZSBhZ2FpbnN0IHRoZSBpbnRlcmZhY2UgaXRzZWxmLlxuICovXG5leHBvcnQgY2xhc3MgU3RlcCB7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaHVtYW4tcmVhZGFibGUgc3RlcCBfbmFtZS5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEZsYWcgaWYgc3RlcCBpcyBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2NvbXBsZXRlOiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQ2FsbGJhY2sgZnVuY3Rpb24gdG8gcnVuIG9uIHN0ZXAgZXhlY3V0aW9uLlxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfY2FsbGJhY2s6IGFueTtcblxuICAgIC8qKlxuICAgICAqIFN0ZXAgdmFsaWRhdGlvbiBlcnJvci5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgX2ZhaWx1cmU6IHN0cmluZztcblxuICAgIHB1YmxpYyBzZXQgZmFpbHVyZShtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fZmFpbHVyZSA9IG1lc3NhZ2U7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBjYWxsYmFjayhjYWxsYmFjazogYW55KSB7XG4gICAgICAgIHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXQgY29tcGxldGUgYW5kIHdpcGUgb3V0IGFueSBmYWlsdXJlXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXG4gICAgICovXG4gICAgcHVibGljIHNldCBjb21wbGV0ZShjb21wbGV0ZTogYm9vbGVhbikge1xuICAgICAgICBsZXQgcyA9IHRoaXM7XG4gICAgICAgIGlmIChjb21wbGV0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcy5fY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgcy5mYWlsdXJlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMuX2NvbXBsZXRlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59Il19
