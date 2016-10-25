"use strict";
/**
 * An interface step which allows GET requests to be made against the interface itself.
 */
var Step = (function () {
    function Step() {
    }
    /**
     * Set complete and wipe out any failure
     * @param complete
     */
    Step.prototype.setComplete = function (complete) {
        var s = this;
        if (complete === true) {
            s.complete = true;
            s.failure = null;
        }
        else {
            s.complete = false;
        }
    };
    return Step;
}());
exports.Step = Step;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aS9zdGVwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7R0FFRztBQUNIO0lBQUE7SUFtQ0EsQ0FBQztJQWJHOzs7T0FHRztJQUNJLDBCQUFXLEdBQWxCLFVBQW1CLFFBQWlCO1FBQ2hDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNiLEVBQUUsQ0FBQyxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3ZCLENBQUM7SUFDTCxDQUFDO0lBQ0wsV0FBQztBQUFELENBbkNBLEFBbUNDLElBQUE7QUFuQ1ksWUFBSSxPQW1DaEIsQ0FBQSIsImZpbGUiOiJsaWIvdWkvc3RlcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQW4gaW50ZXJmYWNlIHN0ZXAgd2hpY2ggYWxsb3dzIEdFVCByZXF1ZXN0cyB0byBiZSBtYWRlIGFnYWluc3QgdGhlIGludGVyZmFjZSBpdHNlbGYuXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGVwIHtcblxuICAgIC8qKlxuICAgICAqIFRoZSBodW1hbi1yZWFkYWJsZSBzdGVwIG5hbWUuXG4gICAgICovXG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIEZsYWcgaWYgc3RlcCBpcyBjb21wbGV0ZSBvciBub3RcbiAgICAgKi9cbiAgICBwdWJsaWMgY29tcGxldGU6IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBDYWxsYmFjayBmdW5jdGlvbiB0byBydW4gb24gc3RlcCBleGVjdXRpb24uXG4gICAgICovXG4gICAgcHVibGljIGNhbGxiYWNrOiBhbnk7XG5cbiAgICAvKipcbiAgICAgKiBTdGVwIHZhbGlkYXRpb24gZXJyb3IuXG4gICAgICovXG4gICAgcHVibGljIGZhaWx1cmU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFNldCBjb21wbGV0ZSBhbmQgd2lwZSBvdXQgYW55IGZhaWx1cmVcbiAgICAgKiBAcGFyYW0gY29tcGxldGVcbiAgICAgKi9cbiAgICBwdWJsaWMgc2V0Q29tcGxldGUoY29tcGxldGU6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IHMgPSB0aGlzO1xuICAgICAgICBpZiAoY29tcGxldGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHMuY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgcy5mYWlsdXJlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMuY29tcGxldGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn0iXX0=
