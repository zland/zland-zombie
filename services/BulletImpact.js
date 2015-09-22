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

var math = require('core/math');
var _ = require('underscore');

function BulletImpact(previousBulletPosition, bulletPosition, bullet) {
  this.previousBulletPosition = previousBulletPosition;
  this.bulletPosition = bulletPosition;
  this.bullet = bullet;
  this.path = this.calculatePath();
}

BulletImpact.prototype = {
  calculatePath_old: function() {
    var absPosition, max, path, position, xunits, yunits;

    xunits = this.bullet.xcos * 1;
    yunits = this.bullet.ysin * 1;

    var startPosition = this.previousBulletPosition;
    var endPosition = this.bulletPosition;
    var absStartPositionData = this.getAbsolutePositionData(startPosition, xunits, yunits);
    var absEndPositionData = this.getAbsolutePositionData(endPosition, xunits, yunits);

    path = {
      x: {},
      y: {}
    };

    var maxX = absEndPositionData.x;
    var maxY = absEndPositionData.y

    while (absStartPositionData.x <= maxX || absStartPositionData.y < maxY) {
      path.y[startPosition.y.toFixed(0)] = {
        x: startPosition.x,
        y: startPosition.y
      };
      startPosition.x += xunits;
      startPosition.y += yunits;
      absStartPositionData.x += absStartPositionData.xunits;
      absStartPositionData.y += absStartPositionData.yunits;
    }

    return path;
  },
  calculatePath: function() {
    var distanceData = math.distance(this.previousBulletPosition, this.bulletPosition);
    var moves = 0;
    var xunits = this.bullet.xcos * 1;
    var yunits = this.bullet.ysin * 1;
    var startPosition = _.clone(this.previousBulletPosition);

    var path = {
      x: {},
      y: {}
    };

    while (moves <= distanceData.moves) {
      path.y[startPosition.y.toFixed(0)] = {
        x: startPosition.x,
        y: startPosition.y
      };
      startPosition.x += xunits;
      startPosition.y += yunits;
      moves++;
    }

    return path;
  },

  getAbsolutePositionData: function(position, xunits, yunits) {
    return {
      x: Math.abs(position.x),
      y: Math.abs(position.y),
      xunits: Math.abs(xunits),
      yunits: Math.abs(yunits)
    };
  },

  calculateImpact: function(bulletPath, bullet) {
    var bodyPart, j, k, len, len1, pos, ref, ref1, zombie;
    ref = this.zombies;
    for (j = 0, len = ref.length; j < len; j++) {
      zombie = ref[j];
      ref1 = zombie.bodyParts;
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        bodyPart = ref1[k];
        pos = this.getImpactPosition(bulletPath, bodyPart);
        if (pos) {
          bodyPart.$el.trigger('hit', bullet);
        }
        if (!bullet.model.hasCharge()) {
          bullet.model.set('endPosition', pos);
          return this;
        }
      }
    }
    return this;
  },

  bulletHitElement: function($el) {
    var pos, x1, x2, y1, y2;
    pos = $el.get(0).getBoundingClientRect();
    x2 = Math.round(pos.left + $el.width());
    x1 = Math.round(pos.left);
    y2 = Math.round(pos.top + $el.height());
    y1 = Math.round(pos.top);
    while (y2 >= y1) {
      if (this.path.y[y2] && this.path.y[y2].x >= x1 && this.path.y[y2].x <= x2) {
        return this.path.y[y2];
      }
      y2--;
    }
    // while (x2 >= x1) {
    //   if (this.path.x[x2] && this.path.x[x2].y >= y1 && this.path.x[x2].y <= y2) {
    //     return this.path.x[x2];
    //   }
    //   x2--;
    // }
  }
};


module.exports = BulletImpact;
