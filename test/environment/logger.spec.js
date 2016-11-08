var should = require('chai').should();
var Antfarm = require('./../../lib/antfarm');

xdescribe('Logger', function() {

    var af;

    describe('Options', function() {
        it('should be able to log to console without a log file', function(done) {
            try {
                af = new Antfarm({
                    log_out_level: "error"
                });
                done();
            } catch (error) {
                should.fail('Error constructing empty antfarm');
                done();
            }
        });
    });
});

