/* eslint-disable @typescript-eslint/no-var-requires *//* eslint-disable prettier/prettier */
var base = require("./webpack.config.base");

module.exports = base.merge({
    // mode: "Dev"
    devtool: 'source-map',
});