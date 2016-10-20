"use strict";
/**
 * The LifeEvent class provides a lifecycle that can be provided to debug job failures.
 */
var LifeEvent = (function () {
    function LifeEvent(verb, start, finish) {
        var le = this;
        le.date = new Date();
        le.verb = verb;
        le.start = start;
        le.finish = finish;
    }
    LifeEvent.prototype.getStatement = function () {
        var le = this;
        return le.verb + " from " + le.start + " to " + le.finish;
    };
    ;
    return LifeEvent;
}());
exports.LifeEvent = LifeEvent;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOztHQUVHO0FBQ0g7SUFPSSxtQkFBWSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU07UUFDM0IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3JCLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2YsRUFBRSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDakIsRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVNLGdDQUFZLEdBQW5CO1FBQ0ksSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsTUFBTSxDQUFJLEVBQUUsQ0FBQyxJQUFJLGNBQVMsRUFBRSxDQUFDLEtBQUssWUFBTyxFQUFFLENBQUMsTUFBUSxDQUFDO0lBQ3pELENBQUM7O0lBRUwsZ0JBQUM7QUFBRCxDQXBCQSxBQW9CQyxJQUFBO0FBcEJZLGlCQUFTLFlBb0JyQixDQUFBIiwiZmlsZSI6ImxpYi9lbnZpcm9ubWVudC9saWZlRXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoZSBMaWZlRXZlbnQgY2xhc3MgcHJvdmlkZXMgYSBsaWZlY3ljbGUgdGhhdCBjYW4gYmUgcHJvdmlkZWQgdG8gZGVidWcgam9iIGZhaWx1cmVzLlxuICovXG5leHBvcnQgY2xhc3MgTGlmZUV2ZW50IHtcblxuICAgIHByb3RlY3RlZCBkYXRlOiBEYXRlO1xuICAgIHByb3RlY3RlZCB2ZXJiOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHN0YXJ0OiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIGZpbmlzaDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IodmVyYiwgc3RhcnQsIGZpbmlzaCkge1xuICAgICAgICBsZXQgbGUgPSB0aGlzO1xuICAgICAgICBsZS5kYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgbGUudmVyYiA9IHZlcmI7XG4gICAgICAgIGxlLnN0YXJ0ID0gc3RhcnQ7XG4gICAgICAgIGxlLmZpbmlzaCA9IGZpbmlzaDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0U3RhdGVtZW50KCkge1xuICAgICAgICBsZXQgbGUgPSB0aGlzO1xuICAgICAgICByZXR1cm4gYCR7bGUudmVyYn0gZnJvbSAke2xlLnN0YXJ0fSB0byAke2xlLmZpbmlzaH1gO1xuICAgIH07XG5cbn0iXX0=
