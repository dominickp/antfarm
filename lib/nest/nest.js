"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shortid = require("shortid");
/**
 * A nest is a resource that holds or produces jobs.
 */
var Nest = (function () {
    function Nest(e, name) {
        this.e = e;
        this._id = shortid.generate();
        this._name = name;
    }
    Object.defineProperty(Nest.prototype, "id", {
        get: function () {
            return this._id;
        },
        enumerable: true,
        configurable: true
    });
    Nest.prototype.toString = function () {
        return "Nest";
    };
    Object.defineProperty(Nest.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            this._name = name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Nest.prototype, "tunnel", {
        get: function () {
            return this._tunnel;
        },
        enumerable: true,
        configurable: true
    });
    Nest.prototype.register = function (tunnel) {
        this._tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        var ns = this;
        ns.e.log(1, "Job \"" + job.name + "\" arrived in Nest \"" + ns.name + "\".", ns);
        job.tunnel = ns.tunnel;
        job.nest = ns;
        ns.tunnel.arrive(job, ns);
    };
    Nest.prototype.take = function (job, callback) {
        throw "Base Nest class cannot take any jobs.";
    };
    return Nest;
}());
exports.Nest = Nest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L25lc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFJQSxJQUFRLE9BQU8sR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFFckM7O0dBRUc7QUFDSDtJQU9JLGNBQVksQ0FBYyxFQUFFLElBQVk7UUFDcEMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBRUQsc0JBQVcsb0JBQUU7YUFBYjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ3BCLENBQUM7OztPQUFBO0lBRU0sdUJBQVEsR0FBZjtRQUNJLE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELHNCQUFXLHNCQUFJO2FBQWY7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDO2FBRUQsVUFBZ0IsSUFBWTtZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUN0QixDQUFDOzs7T0FKQTtJQU1ELHNCQUFXLHdCQUFNO2FBQWpCO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDeEIsQ0FBQzs7O09BQUE7SUFFTSx1QkFBUSxHQUFmLFVBQWdCLE1BQWM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7SUFDMUIsQ0FBQztJQUVNLHFCQUFNLEdBQWIsVUFBYyxHQUFRO1FBQ2xCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFRLEdBQUcsQ0FBQyxJQUFJLDZCQUFzQixFQUFFLENBQUMsSUFBSSxRQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkUsR0FBRyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTSxtQkFBSSxHQUFYLFVBQVksR0FBUSxFQUFFLFFBQWE7UUFDL0IsTUFBTSx1Q0FBdUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0wsV0FBQztBQUFELENBaERBLEFBZ0RDLElBQUE7QUFoRHFCLG9CQUFJIiwiZmlsZSI6ImxpYi9uZXN0L25lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xyXG5pbXBvcnQgeyBKb2IgfSBmcm9tIFwiLi4vam9iL2pvYlwiO1xyXG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xyXG5cclxuY29uc3QgICBzaG9ydGlkID0gcmVxdWlyZShcInNob3J0aWRcIik7XHJcblxyXG4vKipcclxuICogQSBuZXN0IGlzIGEgcmVzb3VyY2UgdGhhdCBob2xkcyBvciBwcm9kdWNlcyBqb2JzLlxyXG4gKi9cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5lc3Qge1xyXG5cclxuICAgIHByb3RlY3RlZCBfaWQ6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIF90dW5uZWw6IFR1bm5lbDtcclxuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlOiBFbnZpcm9ubWVudCwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5lID0gZTtcclxuICAgICAgICB0aGlzLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcclxuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGlkKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiTmVzdFwiO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IG5hbWUobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCB0dW5uZWwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R1bm5lbDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgcmVnaXN0ZXIodHVubmVsOiBUdW5uZWwpIHtcclxuICAgICAgICB0aGlzLl90dW5uZWwgPSB0dW5uZWw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFycml2ZShqb2I6IEpvYikge1xyXG4gICAgICAgIGxldCBucyA9IHRoaXM7XHJcbiAgICAgICAgbnMuZS5sb2coMSwgYEpvYiBcIiR7am9iLm5hbWV9XCIgYXJyaXZlZCBpbiBOZXN0IFwiJHtucy5uYW1lfVwiLmAsIG5zKTtcclxuICAgICAgICBqb2IudHVubmVsID0gbnMudHVubmVsO1xyXG4gICAgICAgIGpvYi5uZXN0ID0gbnM7XHJcbiAgICAgICAgbnMudHVubmVsLmFycml2ZShqb2IsIG5zKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdGFrZShqb2I6IEpvYiwgY2FsbGJhY2s6IGFueSkge1xyXG4gICAgICAgIHRocm93IFwiQmFzZSBOZXN0IGNsYXNzIGNhbm5vdCB0YWtlIGFueSBqb2JzLlwiO1xyXG4gICAgfVxyXG59Il19
