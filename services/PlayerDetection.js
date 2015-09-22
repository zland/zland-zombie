/*!
 * Copyright 2015 Florian Biewald
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var _ = require('underscore');
var math = require('core/math');

var LOOK_ANGLE = 30;
var LOOK_SPACING = 150;

var _lookAngle, _zombieRotation, _lookLeft, _lookRight, _lookNearRight,
    _globalRotation, _zombiePos, _playerPos, _lookValues;

function calculateLook(rotation) {
  var theta, xunits, yunits;

  var units = math.vectorUnits(_globalRotation - rotation);

  // theta = (Math.PI / 180) * (-90 + rotation - _globalRotation);
  // if (theta < 0) {
  //   theta += 2 * Math.PI;
  // }
  // xunits = Math.cos(theta) * 1;
  // yunits = Math.sin(theta) * 1;
  return {
    y: _zombiePos.y + units.y * LOOK_SPACING,
    x: _zombiePos.x + units.x * LOOK_SPACING
  };
}

function calcMinMaxLookValues() {
  _lookValues = {
    minX: _.min([_lookLeft.x, _lookRight.x, _lookNearRight.x, _zombiePos.x]),
    maxX: _.max([_lookLeft.x, _lookRight.x, _lookNearRight.x, _zombiePos.x]),
    minY: _.min([_lookLeft.y, _lookRight.y, _lookNearRight.y, _zombiePos.y]),
    maxY: _.max([_lookLeft.y, _lookRight.y, _lookNearRight.y, _zombiePos.y])
  };
}

function calculateIsPlayerInSight() {
  if (!_playerPos) {
    return false;
  }
  return _playerPos.x > _lookValues.minX
        && _playerPos.x < _lookValues.maxX
        && _playerPos.y > _lookValues.minY
        && _playerPos.y < _lookValues.maxY;
}

var PlayerDetection = {
  isPlayerInSight: function(zombieRotation, globalRotation, playerPos, zombiePos) {
    _zombieRotation = zombieRotation;
    _globalRotation = globalRotation;
    _zombiePos = zombiePos;
    _playerPos = playerPos;
    _lookLeft = calculateLook(_zombieRotation - LOOK_ANGLE);
    _lookRight = calculateLook(_zombieRotation + LOOK_ANGLE);
    _lookNearRight = calculateLook(_zombieRotation + 90);
    calcMinMaxLookValues();
    return calculateIsPlayerInSight();
  }
};

module.exports = PlayerDetection;
