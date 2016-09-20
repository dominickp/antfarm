var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

describe('Antfarm', function() {

    var options = {};
    var af;

    beforeEach(function() {
        af = new Antfarm(options);
    });

    describe('Loading', function() {
        it('should load when required', function() {

            var version = af.version();

            af.should.be.a('object');
            version.should.be.a('string');
        });
        it('should create tunnels', function() {
            var tunnel = af.createTunnel("Hello");
            var tunnel_name = tunnel.name;

            tunnel.should.be.a('object');
            tunnel_name.should.equal("Hello");
        });
    });
});

