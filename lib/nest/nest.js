"use strict";
var shortid = require("shortid");
/**
 * A nest is a resource that holds or produces jobs.
 */
var Nest = (function () {
    function Nest(e, name) {
        this.e = e;
        this.id = shortid.generate();
        this._name = name;
    }
    Nest.prototype.getId = function () {
        return this.id;
    };
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
    Nest.prototype.getTunnel = function () {
        return this.tunnel;
    };
    Nest.prototype.register = function (tunnel) {
        this.tunnel = tunnel;
    };
    Nest.prototype.arrive = function (job) {
        var ns = this;
        ns.e.log(1, "Job \"" + job.name + "\" arrived in Nest \"" + ns.name + "\".", ns);
        job.setTunnel(ns.tunnel);
        job.setNest(ns);
        ns.tunnel.arrive(job, ns);
    };
    return Nest;
}());
exports.Nest = Nest;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9uZXN0L25lc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUlBLElBQVEsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUVyQzs7R0FFRztBQUNIO0lBT0ksY0FBWSxDQUFjLEVBQUUsSUFBWTtRQUNwQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxvQkFBSyxHQUFaO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUVNLHVCQUFRLEdBQWY7UUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxzQkFBVyxzQkFBSTthQUFmO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdEIsQ0FBQzthQUVELFVBQWdCLElBQVk7WUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDdEIsQ0FBQzs7O09BSkE7SUFNTSx3QkFBUyxHQUFoQjtRQUNJLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO0lBQ3ZCLENBQUM7SUFFTSx1QkFBUSxHQUFmLFVBQWdCLE1BQWM7UUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7SUFDekIsQ0FBQztJQUVNLHFCQUFNLEdBQWIsVUFBYyxHQUFRO1FBQ2xCLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxXQUFRLEdBQUcsQ0FBQyxJQUFJLDZCQUFzQixFQUFFLENBQUMsSUFBSSxRQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkUsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNoQixFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQTVDQSxBQTRDQyxJQUFBO0FBNUNxQixZQUFJLE9BNEN6QixDQUFBIiwiZmlsZSI6ImxpYi9uZXN0L25lc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBUdW5uZWwgfSBmcm9tIFwiLi4vdHVubmVsL3R1bm5lbFwiO1xuaW1wb3J0IHsgSm9iIH0gZnJvbSBcIi4uL2pvYi9qb2JcIjtcbmltcG9ydCB7IEVudmlyb25tZW50IH0gZnJvbSBcIi4uL2Vudmlyb25tZW50L2Vudmlyb25tZW50XCI7XG5cbmNvbnN0ICAgc2hvcnRpZCA9IHJlcXVpcmUoXCJzaG9ydGlkXCIpO1xuXG4vKipcbiAqIEEgbmVzdCBpcyBhIHJlc291cmNlIHRoYXQgaG9sZHMgb3IgcHJvZHVjZXMgam9icy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIE5lc3Qge1xuXG4gICAgcHJvdGVjdGVkIGlkOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIF9uYW1lOiBzdHJpbmc7XG4gICAgcHJvdGVjdGVkIHR1bm5lbDogVHVubmVsO1xuICAgIHByb3RlY3RlZCBlOiBFbnZpcm9ubWVudDtcblxuICAgIGNvbnN0cnVjdG9yKGU6IEVudmlyb25tZW50LCBuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lID0gZTtcbiAgICAgICAgdGhpcy5pZCA9IHNob3J0aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldElkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcIk5lc3RcIjtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbmFtZShuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFR1bm5lbCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVubmVsO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWdpc3Rlcih0dW5uZWw6IFR1bm5lbCkge1xuICAgICAgICB0aGlzLnR1bm5lbCA9IHR1bm5lbDtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXJyaXZlKGpvYjogSm9iKSB7XG4gICAgICAgIGxldCBucyA9IHRoaXM7XG4gICAgICAgIG5zLmUubG9nKDEsIGBKb2IgXCIke2pvYi5uYW1lfVwiIGFycml2ZWQgaW4gTmVzdCBcIiR7bnMubmFtZX1cIi5gLCBucyk7XG4gICAgICAgIGpvYi5zZXRUdW5uZWwobnMudHVubmVsKTtcbiAgICAgICAgam9iLnNldE5lc3QobnMpO1xuICAgICAgICBucy50dW5uZWwuYXJyaXZlKGpvYiwgbnMpO1xuICAgIH1cbn0iXX0=
