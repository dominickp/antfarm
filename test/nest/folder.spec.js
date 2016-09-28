var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

var tmp = require('tmp');

describe('Nest Folder', function() {

    var options = {log_out_level: "error"};
    var af, tunnel, tmpobj;

    beforeEach(function() {
        af = new Antfarm(options);
        tunnel = af.createTunnel("Nest testing");
        tmpobj = tmp.dirSync();
    });

    afterEach(function() {
        tmpobj.removeCallback();
    });

    describe('Loading', function() {
        it('should create a folder', function() {
            var folder = af.createFolderNest(tmpobj.name);

            folder.getName().should.not.be.empty;
            folder.getName().should.be.a('string');
            folder.should.be.a('object');
        });
    });

});

