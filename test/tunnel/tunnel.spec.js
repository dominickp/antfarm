var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

describe('Tunnels', function() {

    var options = {};
    var af, tunnel;

    beforeEach(function() {
        af = new Antfarm(options);
        tunnel = af.createTunnel("Test tunnel");
    });


    it('should get the tunnel name', function () {
        tunnel.getName().should.equal("Test tunnel");
    });

    it('should add a run callback to the run list', function () {
        var my_application = function(job, nest){
            console.log("Do it");
        };
        tunnel.run(my_application);
        tunnel.getRunList().length.should.equal(1);
    });

    it('should add multiple run callbacks to the run list', function () {
        var my_application = function(job, nest){
            console.log("Do it");
        };
        tunnel.run(my_application);
        tunnel.run(my_application);
        tunnel.run(my_application);
        tunnel.getRunList().length.should.equal(3);
    });


    it('should execute a run callback', function () {
        var myObj = {num: 0};
        var myString = "";
        tunnel.run(function(){
            myObj.num++;
            myString = "Something";
        });
        tunnel.executeRun(); // force run

        myObj.num.should.equal(1);
        myString.should.equal("Something");
    });

});
