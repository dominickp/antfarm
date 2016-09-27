var should = require('chai').should();
var Job = require('./../../lib/job/job');
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('Job', function() {

    var options = {
        log_out_level: "error"
    };
    var af, tunnel, tmpDir, nest, temp_file_path;

    before("make temporary log directory", function(done){
        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = dir;
                done()
            }, 600);
        });
    });

    beforeEach("make antfarm, tunnel, and nest", function(done) {
        af = new Antfarm(options);
        tunnel = af.createTunnel("Test tunnel");

        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            if (err) return done(err);
            tmpDir = dir;
            setTimeout(function(){
                nest = af.createFolderNest(dir);
                tunnel.watch(nest);

                done()
            }, 600);
        });


    });

    afterEach("remove temporary file", function(){
        fs.unlinkSync(temp_file_path);
    });

    // Function to add a new job to the watched nest
    var triggerNewJob = function(name){
        temp_file_path = tmpDir + path.sep + name;
        fs.writeFileSync(temp_file_path, "Some dummy data.");
    };

    it('should get the job name', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.getName().should.equal(job_name);
            done();
        });

        triggerNewJob(job_name);
    });

    xit('should get the job name proper', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.getNameProper().should.equal("MyJobFile_001");
            done();
        });

        triggerNewJob(job_name);
    });

    it('should get the extension', function (done) {
        var job_name = "MyJobFile_001.pDf";
        tunnel.run(function(job){
            job.getExtension().should.equal("pdf");
            done();
        });

        triggerNewJob(job_name);
    });

    it('should get the path', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.getPath().should.equal(temp_file_path);
            job.getPath().should.not.be.empty;
            done();
        });

        triggerNewJob(job_name);
    });

    xit('should get whether or not it is locally available', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            should.exist(job.getIsLocallyAvailable());
            job.getIsLocallyAvailable().should.equal(true);
            done();
        });

        triggerNewJob(job_name);
    });


});

