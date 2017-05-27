"use strict";
var demolished_1 = require('./src/demolished');
var demolishedRecorder_1 = require('./src/demolishedRecorder');
var DemolishInstance = (function () {
    function DemolishInstance() {
        var _this = this;
        var analyzerSettings = new demolished_1.Demolished.AudioAnalyzerSettings(8192, 0.85, -100, -30);
        var canvas = document.querySelector("#gl");
        var timeline = window.location.hash === "" ? "timeline.json" : window.location.hash.replace("#", "");
        this.world = new demolished_1.Demolished.World(canvas, "entities/" + timeline, analyzerSettings);
        this.world.onReady = function () {
            _this.onReady();
        };
        this.world.onStart = function () {
            var p = document.querySelector("#record-canvas");
            if (p.checked) {
                var videoStream = _this.world.canvas["captureStream"](60);
                var videoTrack = videoStream.getVideoTracks()[0];
                var audioTrack = _this.world.getAudioTracks()[0];
                _this.recorder = new demolishedRecorder_1.DemolishedRecorder(videoTrack, audioTrack);
                _this.recorder.start(1000);
            }
        };
        this.world.onStop = function () {
            if (_this.recorder) {
                var recorderNode = document.querySelector("#recording");
                _this.recorder.stop();
                var blob = new Blob(_this.recorder.data, {
                    type: 'video/webm'
                });
                var url = window.URL.createObjectURL(blob);
                var downloadlink = document.createElement('a');
                downloadlink.textContent = "download recording";
                downloadlink.href = url;
                recorderNode.classList.remove("hide");
                recorderNode.appendChild(downloadlink);
            }
        };
    }
    DemolishInstance.prototype.onReady = function () { };
    return DemolishInstance;
}());
document.addEventListener("DOMContentLoaded", function () {
    var launchButton = document.querySelector("#full-screen");
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    var demolished = new DemolishInstance();
    window["demo"] = demolished;
    demolished.onReady = function () {
        launchButton.textContent = "Start";
        launchButton.disabled = false;
    };
    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        demolished.world.start(0);
    });
});
