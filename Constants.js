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

var keyMirror = require('keymirror');

module.exports = keyMirror({
  ZOMBIE_POSITION: null,
  ZOMBIE_REACHED_POINT: null,
  ZOMBIE_BREAK_DONE: null,
  ZOMBIE_BODYPART_MOUNTED: null,
  ZOMBIE_HIT: null,
  ZOMBIE_DIED: null,
  ZOMBIE_HEAD_SHOT: null
});
