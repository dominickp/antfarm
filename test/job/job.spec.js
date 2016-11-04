var should = require('chai').should();
var expect = require('chai').expect;
var Job = require('./../../lib/job/job');
var Antfarm = require("./../../lib/antfarm");
var tmp = require('tmp');
var fs = require("fs");
var path = require('path');

describe('Job', function() {

    var options = {
        log_out_level: "error",
    };
    var af, tunnel, tmpDir, nest, temp_file_path;

    before("make temporary log directory", function(done){
        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            if (err) return done(err);
            setTimeout(function(){
                options.log_dir = dir;
                done()
            }, 300);
        });
    });

    beforeEach("make antfarm, tunnel, and nest", function(done) {

        tmp.dir({ unsafeCleanup: true }, function(err, dir) {
            af = new Antfarm(options);
            tunnel = af.createTunnel("Test tunnel");

            options.auto_managed_folder_directory = dir;

            if (err) return done(err);
            tmpDir = dir;
            setTimeout(function(){
                nest = af.createFolderNest(dir);
                tunnel.watch(nest);

                done()
            }, 100);
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
            expect(job.name).not.to.be.undefined;
            job.name.should.equal(job_name);
            done();
        });

        triggerNewJob(job_name);
    });

    it('should get the job name proper', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.nameProper.should.equal("MyJobFile_001");
            done();
        });

        triggerNewJob(job_name);
    });

    it('should get the extension', function (done) {
        var job_name = "MyJobFile_001.pDf";
        tunnel.run(function(job){
            job.extension.should.equal("pdf");
            done();
        });

        triggerNewJob(job_name);
    });

    it('should get the path', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.path.should.equal(temp_file_path);
            job.path.should.not.be.empty;
            done();
        });

        triggerNewJob(job_name);
    });

    xit('should get the size', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.size.should.equal("16 B");
            job.sizeBytes.should.equal(16);
            job.size.should.not.be.empty;
            done();
        });

        triggerNewJob(job_name);
    });

    it('should be able to write to the log', function (done) {
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.log(0, "Debug message");
            job.log(1, "Info message");
            job.log(2, "Warning message");
            done();
        });

        triggerNewJob(job_name);
    });

    it('should transfer from one tunnel to another', function (done) {
        var tunnel2 = af.createTunnel("Another tunnel");
        var job_name = "MyJobFile_001.pdf";
        tunnel.run(function(job){
            job.name.should.equal("MyJobFile_001.pdf");
            job.transfer(tunnel2);
        });
        tunnel2.run(function(job){
            job.name.should.equal("MyJobFile_001.pdf");
            done();
        });
        triggerNewJob(job_name);
    });

    describe("LifeCycle", function(){
        it('should create a lifecycle', function (done) {
            var job_name = "MyJobFile_001.pdf";
            tunnel.runSync(function(job){
                job.lifeCycle.length.should.equal(1);
                done();
            });
            triggerNewJob(job_name);
        });
        it('should add lifecycle events', function (done) {
            var job_name = "MyJobFile_001.pdf";
            tunnel.runSync(function(job){
                job.name = "Some other _name.pdf";
                job.lifeCycle.length.should.equal(2);
                job.name = "Some other _name.pdf";
                job.lifeCycle.length.should.equal(3);
                done();
            });
            triggerNewJob(job_name);
        });
    });

    describe("properties", function(){
        it('should set and get job property values', function (done) {
            var job_name = "MyJobFile_001.pdf";
            tunnel.run(function(job){
                job.setPropertyValue("JobNumber", 123456);
                job.getPropertyValue("JobNumber").should.equal(123456);
                done();
            });
            triggerNewJob(job_name);
        });
        it('should get property types', function (done) {
            var job_name = "MyJobFile_001.pdf";
            tunnel.run(function(job){
                job.setPropertyValue("JobNumber", 123456);
                job.getPropertyType("JobNumber").should.equal("number");
                job.setPropertyValue("CustomerName", "My customer");
                job.getPropertyType("CustomerName").should.equal("string");
                job.setPropertyValue("Details", {a: 1, b: 2, c: 3});
                job.getPropertyType("Details").should.equal("object");
                job.setPropertyValue("Things", [1, 2, 3]);
                job.getPropertyType("Things").should.equal("array");
                done();
            });
            triggerNewJob(job_name);
        });
    });

    describe("packing", function(){

        var prop1 = 123;
        var prop2 = { x: 567, y: 123456 };
        var prop3 = "something";

        it('pack jobs into zips', function (done) {
            var job_name = "MyJobFile_001.pdf";
            tunnel.run(function(job){
                job.pack(function(packJob){
                    packJob.name.should.equal(job_name+".antpack.zip");
                    packJob.extension.should.equal("zip");
                    done();
                });
            });
            triggerNewJob(job_name);
        });
        it('should unpack file jobs and restore properties when moved', function (done) {
            var unpackTunnel = af.createTunnel("Unpacking tunnel");
            var packHolderNest = af.createAutoFolderNest("job", "packed-holding");
            unpackTunnel.watch(packHolderNest);

            var job_name = "MyJobFile_009.pdf";
            tunnel.run(function(job){
                job.setPropertyValue("prop1", prop1);
                job.setPropertyValue("prop2", prop2);
                job.setPropertyValue("prop3", prop3);
                job.pack(function(packJob){
                    packJob.move(packHolderNest);
                });
            });

            unpackTunnel.run(function(packedJob){
                expect(packedJob.name).to.not.be.undefined;
                packedJob.name.should.equal(job_name+".antpack.zip");
                packedJob.unpack(function(origJob){
                    origJob.name.should.equal(job_name);
                    origJob.extension.should.equal("pdf");
                    origJob.getPropertyValue("prop1").should.equal(prop1);
                    origJob.getPropertyValue("prop2").should.deep.equal(prop2);
                    origJob.getPropertyValue("prop3").should.equal(prop3);
                    done();
                });
            });
            triggerNewJob(job_name);
        });
        it('should unpack file jobs and restore properties when transferred', function (done) {
            var unpackTunnel = af.createTunnel("Unpacking tunnel");

            var job_name = "MyJobFile_008.pdf";
            tunnel.run(function(job){
                job.setPropertyValue("prop1", prop1);
                job.setPropertyValue("prop2", prop2);
                job.setPropertyValue("prop3", prop3);
                job.pack(function(packJob){
                    packJob.transfer(unpackTunnel);
                });
            });

            unpackTunnel.run(function(packedJob){
                packedJob.name.should.equal(job_name+".antpack.zip");
                packedJob.unpack(function(origJob){
                    origJob.name.should.equal(job_name);
                    origJob.extension.should.equal("pdf");
                    origJob.getPropertyValue("prop1").should.equal(prop1);
                    origJob.getPropertyValue("prop2").should.deep.equal(prop2);
                    origJob.getPropertyValue("prop3").should.equal(prop3);
                    done();
                });
            });
            triggerNewJob(job_name);
        });
    });

});

