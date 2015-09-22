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

/**
 * todo
 * determine zombie strengths according to player level
 */

var MapStore = require('map/stores/MapStore');
var ZombieStructure = require('core/datastructures/ZombieStructure');
var _ = require('underscore');
var Immutable = require('immutable');

module.exports = function(positions, id) {
  var zombieId = id;

  return Immutable.fromJS(
    _.extend(ZombieStructure(), {
      id: zombieId,
      pathToPlayer: Immutable.fromJS(positions),
      left: positions[0].x,
      top: positions[0].y
    })
  );
};
