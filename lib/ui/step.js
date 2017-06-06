"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUE7O0dBRUc7QUFDSDtJQUFBO0lBK0RBLENBQUM7SUF6Q0csc0JBQVcseUJBQU87YUFJbEI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO2FBTkQsVUFBbUIsT0FBZTtZQUM5QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUM1QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLDBCQUFRO2FBSW5CO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDMUIsQ0FBQzthQU5ELFVBQW9CLFFBQThEO1lBQzlFLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzlCLENBQUM7OztPQUFBO0lBTUQsc0JBQVcsc0JBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBVUQsc0JBQVcsMEJBQVE7YUFVbkI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMxQixDQUFDO1FBaEJEOzs7V0FHRzthQUNILFVBQW9CLFFBQWlCO1lBQ2pDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztZQUNiLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNwQixDQUFDLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDckIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLENBQUMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLENBQUM7UUFDTCxDQUFDOzs7T0FBQTtJQUtMLFdBQUM7QUFBRCxDQS9EQSxBQStEQyxJQUFBO0FBL0RZLG9CQUFJIiwiZmlsZSI6ImxpYi91aS9zdGVwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtKb2J9IGZyb20gXCIuLi9qb2Ivam9iXCI7XHJcbmltcG9ydCB7V2ViaG9va0ludGVyZmFjZX0gZnJvbSBcIi4vd2ViaG9va0ludGVyZmFjZVwiO1xyXG4vKipcclxuICogQW4gaW50ZXJmYWNlIHN0ZXAgd2hpY2ggYWxsb3dzIEdFVCByZXF1ZXN0cyB0byBiZSBtYWRlIGFnYWluc3QgdGhlIGludGVyZmFjZSBpdHNlbGYuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgU3RlcCB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgaHVtYW4tcmVhZGFibGUgc3RlcCBfbmFtZS5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGbGFnIGlmIHN0ZXAgaXMgY29tcGxldGUgb3Igbm90XHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY29tcGxldGU6IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxsYmFjayBmdW5jdGlvbiB0byBydW4gb24gc3RlcCBleGVjdXRpb24uXHJcbiAgICAgKi9cclxuICAgIHByb3RlY3RlZCBfY2FsbGJhY2s6IGFueTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFN0ZXAgdmFsaWRhdGlvbiBlcnJvci5cclxuICAgICAqL1xyXG4gICAgcHJvdGVjdGVkIF9mYWlsdXJlOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIHNldCBmYWlsdXJlKG1lc3NhZ2U6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2ZhaWx1cmUgPSBtZXNzYWdlO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZmFpbHVyZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZmFpbHVyZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGNhbGxiYWNrKGNhbGxiYWNrOiAoam9iOiBKb2IsIHVpOiBXZWJob29rSW50ZXJmYWNlLCBzdGVwOiBTdGVwKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgdGhpcy5fY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNhbGxiYWNrKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jYWxsYmFjaztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGNvbXBsZXRlIGFuZCB3aXBlIG91dCBhbnkgZmFpbHVyZVxyXG4gICAgICogQHBhcmFtIGNvbXBsZXRlXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXQgY29tcGxldGUoY29tcGxldGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBsZXQgcyA9IHRoaXM7XHJcbiAgICAgICAgaWYgKGNvbXBsZXRlID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIHMuX2NvbXBsZXRlID0gdHJ1ZTtcclxuICAgICAgICAgICAgcy5mYWlsdXJlID0gbnVsbDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzLl9jb21wbGV0ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNvbXBsZXRlKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9jb21wbGV0ZTtcclxuICAgIH1cclxufSJdfQ==
