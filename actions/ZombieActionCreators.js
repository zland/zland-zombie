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

var Dispatcher = require('core/Dispatcher');
var Constants = require('zombie/Constants');

module.exports = {
  position: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_POSITION,
      id: id
    });
  },

  reachedPoint: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_REACHED_POINT,
      id: id
    });
  },

  breakDone: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_BREAK_DONE,
      id: id
    });
  },

  bodyPartMounted: function($bodyPart, bodyPartId, zombieId) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_BODYPART_MOUNTED,
      $bodyPart: $bodyPart,
      bodyPartId: bodyPartId,
      zombieId: zombieId
    });
  },

  hit: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_HIT,
      id: id
    });
  },

  headShot: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_HEAD_SHOT,
      id: id
    });
  },

  died: function(id) {
    Dispatcher.dispatch({
      type: Constants.ZOMBIE_DIED,
      id: id
    });
  }
}
