"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var muse_parse_1 = require("./lib/muse-parse");
var muse_utils_1 = require("./lib/muse-utils");
var zip_samples_1 = require("./lib/zip-samples");
exports.zipSamples = zip_samples_1.zipSamples;
exports.MUSE_SERVICE = 0xfe8d;
var CONTROL_CHARACTERISTIC = '273e0001-4c4d-454d-96be-f03bac821358';
var TELEMETRY_CHARACTERISTIC = '273e000b-4c4d-454d-96be-f03bac821358';
var GYROSCOPE_CHARACTERISTIC = '273e0009-4c4d-454d-96be-f03bac821358';
var ACCELEROMETER_CHARACTERISTIC = '273e000a-4c4d-454d-96be-f03bac821358';
var EEG_CHARACTERISTICS = [
    '273e0003-4c4d-454d-96be-f03bac821358',
    '273e0004-4c4d-454d-96be-f03bac821358',
    '273e0005-4c4d-454d-96be-f03bac821358',
    '273e0006-4c4d-454d-96be-f03bac821358',
    '273e0007-4c4d-454d-96be-f03bac821358',
];
exports.EEG_FREQUENCY = 256;
// These names match the characteristics defined in EEG_CHARACTERISTICS above
exports.channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX'];
var MuseClient = /** @class */ (function () {
    function MuseClient() {
        this.enableAux = false;
        this.deviceName = '';
        this.connectionStatus = new rxjs_1.BehaviorSubject(false);
        this.gatt = null;
        this.lastIndex = null;
        this.lastTimestamp = null;
    }
    MuseClient.prototype.connect = function (gatt) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var device, _a, service, _b, _c, telemetryCharacteristic, _d, gyroscopeCharacteristic, _e, accelerometerCharacteristic, _f, eegObservables, channelCount, _loop_1, this_1, channelIndex;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!gatt) return [3 /*break*/, 1];
                        this.gatt = gatt;
                        return [3 /*break*/, 4];
                    case 1: return [4 /*yield*/, navigator.bluetooth.requestDevice({
                            filters: [{ services: [exports.MUSE_SERVICE] }],
                        })];
                    case 2:
                        device = _g.sent();
                        _a = this;
                        return [4 /*yield*/, device.gatt.connect()];
                    case 3:
                        _a.gatt = _g.sent();
                        _g.label = 4;
                    case 4:
                        this.deviceName = this.gatt.device.name || null;
                        return [4 /*yield*/, this.gatt.getPrimaryService(exports.MUSE_SERVICE)];
                    case 5:
                        service = _g.sent();
                        rxjs_1.fromEvent(this.gatt.device, 'gattserverdisconnected')
                            .pipe(operators_1.first())
                            .subscribe(function () {
                            _this.gatt = null;
                            _this.connectionStatus.next(false);
                        });
                        // Control
                        _b = this;
                        return [4 /*yield*/, service.getCharacteristic(CONTROL_CHARACTERISTIC)];
                    case 6:
                        // Control
                        _b.controlChar = _g.sent();
                        _c = this;
                        return [4 /*yield*/, muse_utils_1.observableCharacteristic(this.controlChar)];
                    case 7:
                        _c.rawControlData = (_g.sent()).pipe(operators_1.map(function (data) { return muse_utils_1.decodeResponse(new Uint8Array(data.buffer)); }), operators_1.share());
                        this.controlResponses = muse_parse_1.parseControl(this.rawControlData);
                        return [4 /*yield*/, service.getCharacteristic(TELEMETRY_CHARACTERISTIC)];
                    case 8:
                        telemetryCharacteristic = _g.sent();
                        _d = this;
                        return [4 /*yield*/, muse_utils_1.observableCharacteristic(telemetryCharacteristic)];
                    case 9:
                        _d.telemetryData = (_g.sent()).pipe(operators_1.map(muse_parse_1.parseTelemetry));
                        return [4 /*yield*/, service.getCharacteristic(GYROSCOPE_CHARACTERISTIC)];
                    case 10:
                        gyroscopeCharacteristic = _g.sent();
                        _e = this;
                        return [4 /*yield*/, muse_utils_1.observableCharacteristic(gyroscopeCharacteristic)];
                    case 11:
                        _e.gyroscopeData = (_g.sent()).pipe(operators_1.map(muse_parse_1.parseGyroscope));
                        return [4 /*yield*/, service.getCharacteristic(ACCELEROMETER_CHARACTERISTIC)];
                    case 12:
                        accelerometerCharacteristic = _g.sent();
                        _f = this;
                        return [4 /*yield*/, muse_utils_1.observableCharacteristic(accelerometerCharacteristic)];
                    case 13:
                        _f.accelerometerData = (_g.sent()).pipe(operators_1.map(muse_parse_1.parseAccelerometer));
                        this.eventMarkers = new rxjs_1.Subject();
                        // EEG
                        this.eegCharacteristics = [];
                        eegObservables = [];
                        channelCount = this.enableAux ? EEG_CHARACTERISTICS.length : 4;
                        _loop_1 = function (channelIndex) {
                            var characteristicId, eegChar, _a, _b;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        characteristicId = EEG_CHARACTERISTICS[channelIndex];
                                        return [4 /*yield*/, service.getCharacteristic(characteristicId)];
                                    case 1:
                                        eegChar = _c.sent();
                                        _b = (_a = eegObservables).push;
                                        return [4 /*yield*/, muse_utils_1.observableCharacteristic(eegChar)];
                                    case 2:
                                        _b.apply(_a, [(_c.sent()).pipe(operators_1.map(function (data) {
                                                var eventIndex = data.getUint16(0);
                                                return {
                                                    electrode: channelIndex,
                                                    index: eventIndex,
                                                    samples: muse_parse_1.decodeEEGSamples(new Uint8Array(data.buffer).subarray(2)),
                                                    timestamp: _this.getTimestamp(eventIndex),
                                                };
                                            }))]);
                                        this_1.eegCharacteristics.push(eegChar);
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        channelIndex = 0;
                        _g.label = 14;
                    case 14:
                        if (!(channelIndex < channelCount)) return [3 /*break*/, 17];
                        return [5 /*yield**/, _loop_1(channelIndex)];
                    case 15:
                        _g.sent();
                        _g.label = 16;
                    case 16:
                        channelIndex++;
                        return [3 /*break*/, 14];
                    case 17:
                        this.eegReadings = rxjs_1.merge.apply(void 0, eegObservables);
                        this.connectionStatus.next(true);
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.sendCommand = function (cmd) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.controlChar.writeValue(muse_utils_1.encodeCommand(cmd))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var preset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pause()];
                    case 1:
                        _a.sent();
                        preset = this.enableAux ? 'p20' : 'p21';
                        return [4 /*yield*/, this.controlChar.writeValue(muse_utils_1.encodeCommand(preset))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.controlChar.writeValue(muse_utils_1.encodeCommand('s'))];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.resume()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.pause = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendCommand('h')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.resume = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendCommand('d')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.deviceInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var resultListener;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resultListener = this.controlResponses.pipe(operators_1.filter(function (r) { return !!r.fw; }), operators_1.take(1)).toPromise();
                        return [4 /*yield*/, this.sendCommand('v1')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, resultListener];
                }
            });
        });
    };
    MuseClient.prototype.injectMarker = function (value, timestamp) {
        if (timestamp === void 0) { timestamp = new Date().getTime(); }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.eventMarkers.next({ value: value, timestamp: timestamp })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MuseClient.prototype.disconnect = function () {
        if (this.gatt) {
            this.lastIndex = null;
            this.lastTimestamp = null;
            this.gatt.disconnect();
            this.connectionStatus.next(false);
        }
    };
    MuseClient.prototype.getTimestamp = function (eventIndex) {
        var SAMPLES_PER_READING = 12;
        var READING_DELTA = 1000 * (1.0 / exports.EEG_FREQUENCY) * SAMPLES_PER_READING;
        if (this.lastIndex === null || this.lastTimestamp === null) {
            this.lastIndex = eventIndex;
            this.lastTimestamp = new Date().getTime() - READING_DELTA;
        }
        // Handle wrap around
        while (this.lastIndex - eventIndex > 0x1000) {
            eventIndex += 0x10000;
        }
        if (eventIndex === this.lastIndex) {
            return this.lastTimestamp;
        }
        if (eventIndex > this.lastIndex) {
            this.lastTimestamp += READING_DELTA * (eventIndex - this.lastIndex);
            this.lastIndex = eventIndex;
            return this.lastTimestamp;
        }
        else {
            return this.lastTimestamp - READING_DELTA * (this.lastIndex - eventIndex);
        }
    };
    return MuseClient;
}());
exports.MuseClient = MuseClient;
//# sourceMappingURL=muse.js.map