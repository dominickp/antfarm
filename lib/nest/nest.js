"use strict";
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
    return Nest;
}());
exports.Nest = Nest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L25lc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUlBLElBQVEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVyQzs7R0FFRztBQUNIO0lBT0ksY0FBWSxDQUFjLEVBQUUsSUFBWTtRQUNwQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxzQkFBVyxvQkFBRTthQUFiO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFFTSx1QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsc0JBQVcsc0JBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBTUQsc0JBQVcsd0JBQU07YUFBakI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVNLHVCQUFRLEdBQWYsVUFBZ0IsTUFBYztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUMxQixDQUFDO0lBRU0scUJBQU0sR0FBYixVQUFjLEdBQVE7UUFDbEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsR0FBRyxDQUFDLElBQUksNkJBQXNCLEVBQUUsQ0FBQyxJQUFJLFFBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRSxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDdkIsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQTVDQSxBQTRDQyxJQUFBO0FBNUNxQixZQUFJLE9BNEN6QixDQUFBIiwiZmlsZSI6ImxpYi9uZXN0L25lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSBcIi4uL2pvYi9qb2JcIjtcbmltcG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpO1xuXG4vKipcbiAqIEEgbmVzdCBpcyBhIHJlc291cmNlIHRoYXQgaG9sZHMgb3IgcHJvZHVjZXMgam9icy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5lc3Qge1xuXG4gICAgcHJvdGVjdGVkIF9pZDogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfbmFtZTogc3RyaW5nO1xuICAgIHByb3RlY3RlZCBfdHVubmVsOiBUdW5uZWw7XG4gICAgcHJvdGVjdGVkIGU6IEVudmlyb25tZW50O1xuXG4gICAgY29uc3RydWN0b3IoZTogRW52aXJvbm1lbnQsIG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmUgPSBlO1xuICAgICAgICB0aGlzLl9pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBpZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkO1xuICAgIH1cblxuICAgIHB1YmxpYyB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFwiTmVzdFwiO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuYW1lKG5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IHR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3R1bm5lbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVnaXN0ZXIodHVubmVsOiBUdW5uZWwpIHtcbiAgICAgICAgdGhpcy5fdHVubmVsID0gdHVubmVsO1xuICAgIH1cblxuICAgIHB1YmxpYyBhcnJpdmUoam9iOiBKb2IpIHtcbiAgICAgICAgbGV0IG5zID0gdGhpcztcbiAgICAgICAgbnMuZS5sb2coMSwgYEpvYiBcIiR7am9iLm5hbWV9XCIgYXJyaXZlZCBpbiBOZXN0IFwiJHtucy5uYW1lfVwiLmAsIG5zKTtcbiAgICAgICAgam9iLnR1bm5lbCA9IG5zLnR1bm5lbDtcbiAgICAgICAgam9iLm5lc3QgPSBucztcbiAgICAgICAgbnMudHVubmVsLmFycml2ZShqb2IsIG5zKTtcbiAgICB9XG59Il19
