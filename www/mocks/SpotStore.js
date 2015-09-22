'use strict';
var Immutable = require('immutable');
var ZombieStructure = require('core/datastructures/ZombieStructure');
var assign = require('object-assign');
var ChangeEventEmitter = require('core/ChangeEventEmitter');

module.exports = assign({}, ChangeEventEmitter, {
    getPlayer: function() {
      return this.mockData.player;
    },
    getSpotById: function() {
      return this.mockData.zombie;
    },
    mockData: {
      zombie: Immutable.fromJS(ZombieStructure())
    }
});
