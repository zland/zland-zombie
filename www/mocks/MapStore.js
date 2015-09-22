'use strict';
var Immutable = require('immutable');
var PlayerStructure = require('core/datastructures/PlayerStructure');
var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');

module.exports = assign({}, ChangeEventEmitter, {
    getPlayer: function() {
      return this.mockData.player;
    },
    getMoveDiffX: function() {
      return 0;
    },
    getMoveDiffY: function() {
      return 0;
    },
    getOverallMoveDiffX: function() {
      return 0;
    },
    getOverallMoveDiffY: function() {
      return 0;
    },
    mockData: {
      player: Immutable.fromJS(PlayerStructure())
    }
});
