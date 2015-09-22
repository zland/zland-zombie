
'use strict';

window.device = {
  uuid: 1234,
  platform: 'browser'
};

require('fontawesome/css/font-awesome.min');
require('bootstrap/dist/css/bootstrap.min');
require('core/sass/style');

// Promise = require('bluebird');
var React = require('react');
var Zombie = require('zombie/components/Zombie');
var ControlPanel = require('core/components/ControlPanel');
var SpotStoreMock = require('generatorSpot/stores/SpotStore');


React.render(
  <Zombie/>,
  document.getElementById('render-target')
);

var controls = [
  {
    click: function() {
      var zombie = SpotStoreMock.mockData.zombie;
      SpotStoreMock.mockData.zombie = zombie.set('hidden', false);
      SpotStoreMock.emitChange();
    },
    name: "Reveal"
  },
  {
    click: function() {
      var zombie = SpotStoreMock.mockData.zombie;
      SpotStoreMock.mockData.zombie = zombie.set('dead', true);
      SpotStoreMock.emitChange();
    },
    name: "Dead"
  }
];

React.render(
  <ControlPanel controls={controls}/>,
  document.getElementById('control-panel')
);
