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
    Nest.prototype.take = function (job, callback) {
        throw "Base Nest class cannot take any jobs.";
    };
    return Nest;
}());
exports.Nest = Nest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L25lc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUlBLElBQVEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVyQzs7R0FFRztBQUNIO0lBT0ksY0FBWSxDQUFjLEVBQUUsSUFBWTtRQUNwQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFRCxzQkFBVyxvQkFBRTthQUFiO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7SUFFTSx1QkFBUSxHQUFmO1FBQ0ksTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsc0JBQVcsc0JBQUk7YUFBZjtZQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3RCLENBQUM7YUFFRCxVQUFnQixJQUFZO1lBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7OztPQUpBO0lBTUQsc0JBQVcsd0JBQU07YUFBakI7WUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN4QixDQUFDOzs7T0FBQTtJQUVNLHVCQUFRLEdBQWYsVUFBZ0IsTUFBYztRQUMxQixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUMxQixDQUFDO0lBRU0scUJBQU0sR0FBYixVQUFjLEdBQVE7UUFDbEIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLFdBQVEsR0FBRyxDQUFDLElBQUksNkJBQXNCLEVBQUUsQ0FBQyxJQUFJLFFBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRSxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDdkIsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLG1CQUFJLEdBQVgsVUFBWSxHQUFRLEVBQUUsUUFBYTtRQUMvQixNQUFNLHVDQUF1QyxDQUFDO0lBQ2xELENBQUM7SUFDTCxXQUFDO0FBQUQsQ0FoREEsQUFnREMsSUFBQTtBQWhEcUIsWUFBSSxPQWdEekIsQ0FBQSIsImZpbGUiOiJsaWIvbmVzdC9uZXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVHVubmVsIH0gZnJvbSBcIi4uL3R1bm5lbC90dW5uZWxcIjtcbmltcG9ydCB7IEpvYiB9IGZyb20gXCIuLi9qb2Ivam9iXCI7XG5pbXBvcnQgeyBFbnZpcm9ubWVudCB9IGZyb20gXCIuLi9lbnZpcm9ubWVudC9lbnZpcm9ubWVudFwiO1xuXG5jb25zdCAgIHNob3J0aWQgPSByZXF1aXJlKFwic2hvcnRpZFwiKTtcblxuLyoqXG4gKiBBIG5lc3QgaXMgYSByZXNvdXJjZSB0aGF0IGhvbGRzIG9yIHByb2R1Y2VzIGpvYnMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZXN0IHtcblxuICAgIHByb3RlY3RlZCBfaWQ6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX25hbWU6IHN0cmluZztcbiAgICBwcm90ZWN0ZWQgX3R1bm5lbDogVHVubmVsO1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5faWQgPSBzaG9ydGlkLmdlbmVyYXRlKCk7XG4gICAgICAgIHRoaXMuX25hbWUgPSBuYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9pZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIk5lc3RcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldCB0dW5uZWwoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90dW5uZWw7XG4gICAgfVxuXG4gICAgcHVibGljIHJlZ2lzdGVyKHR1bm5lbDogVHVubmVsKSB7XG4gICAgICAgIHRoaXMuX3R1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogSm9iKSB7XG4gICAgICAgIGxldCBucyA9IHRoaXM7XG4gICAgICAgIG5zLmUubG9nKDEsIGBKb2IgXCIke2pvYi5uYW1lfVwiIGFycml2ZWQgaW4gTmVzdCBcIiR7bnMubmFtZX1cIi5gLCBucyk7XG4gICAgICAgIGpvYi50dW5uZWwgPSBucy50dW5uZWw7XG4gICAgICAgIGpvYi5uZXN0ID0gbnM7XG4gICAgICAgIG5zLnR1bm5lbC5hcnJpdmUoam9iLCBucyk7XG4gICAgfVxuXG4gICAgcHVibGljIHRha2Uoam9iOiBKb2IsIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgdGhyb3cgXCJCYXNlIE5lc3QgY2xhc3MgY2Fubm90IHRha2UgYW55IGpvYnMuXCI7XG4gICAgfVxufSJdfQ==
