"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var webpack_config_1 = require("./webpack.config");
webpack_config_1["default"].module.rules[1].use.unshift('style-loader'); // Used to load CSS on dev-server
var config = __assign({}, webpack_config_1["default"], { mode: 'development', devtool: 'cheap-eval-source-map', devServer: {
        historyApiFallback: true,
        port: process.env.PORT || 1337,
        overlay: true,
        stats: webpack_config_1["default"].stats
    } });
module.exports = config;
