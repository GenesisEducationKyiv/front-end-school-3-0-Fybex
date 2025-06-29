"use strict";
// Export all generated protobuf types and services
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
// Genres
__exportStar(require("./generated/genres/v1/genres_pb.js"), exports);
// Tracks
__exportStar(require("./generated/tracks/v1/tracks_pb.js"), exports);
// Health
__exportStar(require("./generated/health/v1/health_pb.js"), exports);
// Re-export common protobuf utilities
var protobuf_1 = require("@bufbuild/protobuf");
Object.defineProperty(exports, "create", { enumerable: true, get: function () { return protobuf_1.create; } });
