var should = require('chai').should();

describe('Antfarm', function() {

    var antfarm = require('./../../lib/antfarm');

    beforeEach(function() {
        antfarm = require('./../../lib/antfarm');
    });

    describe('Loading', function() {
        it('should load when required', function() {

            var version = antfarm.version();

            antfarm.should.be.a('object');
            version.should.be.a('string');
        });
        it('should create tunnels', function() {
            var tunnel = antfarm.createTunnel("Hello");
            var tunnel_name = tunnel.name;

            tunnel.should.be.a('object');
            tunnel_name.should.equal("Hello");
        });
    });
});

