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

var ChangeEventEmitter = require('core/ChangeEventEmitter');
var assign = require('object-assign');
var Dispatcher = require('core/Dispatcher');
var math = require('core/math');
var _ = require('underscore');
var Immutable = require('immutable');
var PlayerService = require('player/services/PlayerService');
var Constants = require('zombie/Constants');
var BulletImpact = require('zombie/services/BulletImpact');
var MapConstants = require('map/Constants');
var WeaponConstants = require('weapon/Constants');
var CoreConstants = require('core/Constants');
var CorePointStructure = require('core/datastructures/CorePointStructure');
var MapStore = require('map/stores/MapStore');
var PlayerStore = require('player/stores/PlayerStore');
var SpotStore = require('generatorSpot/stores/SpotStore');
var SpotService = require('generatorSpot/services/SpotService');
var SpotConstants = require('generatorSpot/Constants');
var MapStore = require('map/stores/MapStore');
var PlayerDetection = require('zombie/services/PlayerDetection');
var PlayerConstants = require('player/Constants');

var _movePointIdOrder = ['p1', 'p2', 'p3'];
/**
 * {
 *   <bullet_id>: <position>
 * }
 */
var _bulletPreviousPositions = {};
/**
 * {
 *   <zombie_id>: {
 *    <bodypart_id>: <element>
 *   }
 * }
 */
var _$bodyParts = {};
/**
 * {
 *   <zombie_id>: {
 *    <point_id>: <element>
 *   }
 * }
 */
var _$points = {};

var _points = Immutable.List();

function generatePoints(zombie, $zombie) {
  var el, offsetToTargetPoint, p1, p1Units, p2, p2Units, p2offset,
      rotationDivergence, targetPoint, targetPointForCalc, theta,
      zombiePos, $zombie, p3;

  targetPoint = zombie.get('pathToPlayer').get(1);
  p3 = Immutable.fromJS(_.extend(CorePointStructure(), {
    x: zombie.get('pathToPlayer').get(0).get('x'),
    y: zombie.get('pathToPlayer').get(0).get('y'),
    zombieId: zombie.get('id'),
    pointId: 'p3'
  }));


  targetPointForCalc = getPointElementById(zombie, 'targetPoint').get(0).getBoundingClientRect();
  targetPointForCalc = {
    x: targetPointForCalc.left,
    y: targetPointForCalc.top
  };
  zombiePos = $zombie.get(0).getBoundingClientRect();
  zombiePos = {
    x: zombiePos.left,
    y: zombiePos.top
  };
  // $targetPoint.remove();
  p2offset = 70;
  offsetToTargetPoint = Math.random() * 100;
  theta = math.calculateAngle(zombiePos, targetPointForCalc, true);
  p1Units = math.units(theta);
  p1 = Immutable.fromJS(_.extend(CorePointStructure(), {
    x: targetPoint.get('x') + (p1Units.x * offsetToTargetPoint),
    y: targetPoint.get('y') + (p1Units.y * offsetToTargetPoint),
    zombieId: zombie.get('id'),
    pointId: 'p1'
  }));
  rotationDivergence = (Math.PI / 180) * 90;
  theta += rotationDivergence;
  p2Units = math.units(theta);
  p2 = Immutable.fromJS(_.extend(CorePointStructure(), {
    x: p1.get('x') + (p2Units.x * p2offset),
    y: p1.get('y') + (p2Units.y * p2offset),
    zombieId: zombie.get('id'),
    pointId: 'p2'
  }));

  zombie = zombie.set('hasAllPoints', true);
  SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));

  return [p1, p2, p3];

  // $p1.css({top: p1.y + 'px', left: p1.x + 'px'});
  // $p2.css({top: p2.y + 'px', left: p2.x + 'px'});
  // $p3.css({top: p3.y + 'px', left: p3.x + 'px'});
}

function updateBullet(newBullet) {
  var bullets = PlayerStore.getWeapon().get('bullets');
  bullets.forEach(function(bullet, index) {
    if (bullet.get('id') === newBullet.id) {
      var player = PlayerService.getPlayer();
      PlayerService.updatePlayer(
        player.mergeIn(['weapons', player.get('selectedWeaponIndex'), 'bullets', index], newBullet)
      );
      return false;
    }
  });
}


function getPointElementById(zombie, pointId) {
  if (!_$points[zombie.get('id')] || !_$points[zombie.get('id')][pointId]) {
    throw new Error('Point with id ' + pointId + ' doesnt have an element (zombie ' + zombie.get('id') + ')');
  }
  return _$points[zombie.get('id')][pointId];
}

function setZombieHunting(zombie) {
  zombie = zombie.merge({
    isMoving: true,
    takeBreak: false,
    isHunting: true
  });
  SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));
}

function renameTopLeftToPoints(topLeft) {
  return {x: topLeft.left, y: topLeft.top};
}

function getNormalizedPoint($el) {
  return {
    x: $el.get(0).getBoundingClientRect().left - $el.width() / 2,
    y: $el.get(0).getBoundingClientRect().top - $el.height() / 2
  };
}

function getNextMovePointIndex(index) {
  var nextIndex = index + 1;

  if (index === null || !_movePointIdOrder[nextIndex]) {
    return 0;
  }
  return nextIndex;
}

function calculateMoveToPoint(zombie, $point) {
  var absDistance, absXunits, absYunits, coveredDistance,
      distance, p1, p2, speed, theta, xunits, yunits, rotation;

  var $zombie = SpotStore.getSpotElementById(zombie.get('id'));
  p1 = {
    x: $zombie.get(0).getBoundingClientRect().left,
    y: $zombie.get(0).getBoundingClientRect().top
  };
  p2 = getNormalizedPoint($point);
  speed = 1;
  distance = math.distance(p1, p2, speed);

  zombie = zombie.set('distanceUnits', {
    x: Math.abs(distance.x / distance.moves),
    y: Math.abs(distance.y / distance.moves)
  });

  theta = math.calculateAngle(p1, p2, MapStore.getMapHeading() * -1);
  zombie = zombie.set('rotation', 180 - (90 - (theta * 180 / Math.PI)));
  // this.model.set('top', p1.y);
  // this.model.set('left', p1.x);
  // this.model.set('rotation', 180 - (90 - (theta * 180 / Math.PI)));
  zombie = zombie.set('moveX', Math.cos(theta) * speed);
  zombie = zombie.set('moveY', Math.sin(theta) * speed);

  zombie = zombie.set('distance', {
    x: Math.abs(distance.x),
    y: Math.abs(distance.y)
  });

  zombie = zombie.set('isMoving', true);
  SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));
}

function dischargeBullet(bullet, resistance) {
  var bulletCharge = bullet.charge - resistance <= 0 ? 0 : bullet.charge - resistance;
  resistance = resistance - bullet.charge;
  bullet.charge = bulletCharge;
  updateBullet(bullet);
  return resistance;
}

var ZombieStore = assign({}, ChangeEventEmitter, {
  getPoints: function() {
    return _points;
  },
  getPointsByZombieId: function(zombieId) {
    return _points.filter(function(point) {
      return point.get('zombieId') === zombieId;
    })
  }
});

ZombieStore.dispatchToken = Dispatcher.register(function(action) {

  Dispatcher.waitFor([SpotStore.dispatchToken, MapStore.dispatchToken]);

  switch (action.type) {
    case SpotConstants.SPOT_PLACED:
      if (action.spot.get('name') !== 'zombie') {
        return;
      }
      var targetPoint = action.spot.get('pathToPlayer').get(1);
      targetPoint = targetPoint.merge({
        zombieId: action.spot.get('id'),
        type: 'target',
        pointId: 'targetPoint'
      });

      _points = _points.push(targetPoint);
      ZombieStore.emitChange();
      break;
    case Constants.ZOMBIE_DIED:
      _points = _points.filterNot(function(point) {
        return point.zombieId === action.id;
      });
      delete _$bodyParts[action.id];
      break;
    case Constants.ZOMBIE_HIT:
      var zombie = SpotStore.getSpotById(action.id);
      if (zombie.dead) {
        return;
      }
      setZombieHunting(zombie);
      calculateMoveToPoint(zombie, PlayerStore.getPlayerElement());
      ZombieStore.emitChange();
      break;
    case Constants.ZOMBIE_BODYPART_MOUNTED:
      var zombie = SpotService.getSpots().get(action.zombieId);

      if (!_$bodyParts[action.zombieId]) {
        _$bodyParts[action.zombieId] = {};
      }
      _$bodyParts[action.zombieId][action.bodyPartId] = action.$bodyPart;

      break;

    case WeaponConstants.WEAPON_BULLET_FLIGHT:
      var bullet = PlayerStore.getBulletById(action.id);

      if (!bullet) {
        return;
      }

      bullet = bullet.toJS();
      var prevBulletPosition = bullet.sourcePoint;

      if (_bulletPreviousPositions[action.id]) {
        prevBulletPosition = _bulletPreviousPositions[action.id];
      }

      _bulletPreviousPositions[action.id] = action.position;

      var bulletPosition = action.position;
      var bulletImpact = new BulletImpact(prevBulletPosition, bulletPosition, bullet);
      var zombies = SpotStore.getSpotsByName('zombie');
      var changed = false;

      zombies.forEach(function(zombie) {
        var hasHit = false;
        var newZombie;
        // awww this is important for the stats
        if (zombie.get('hidden') || zombie.get('dead')) {
          return;
        }

        zombie.get('bodyParts').forEach(function(bodyPart, key) {
          if (bodyPart.get('dead')) {
            return;
          }
          if (!bulletImpact.bulletHitElement(_$bodyParts[zombie.get('id')][key])) {
            return;
          }

          changed = true;

          var remainingBodyResistance = dischargeBullet(bullet, bodyPart.get('resistance'));

          // discharge bullet and adapt resistance
          newZombie = zombie.setIn(['bodyParts', key, 'resistance'], remainingBodyResistance);

          hasHit = true;

          if (remainingBodyResistance <= 0) {
            newZombie = newZombie.setIn(['bodyParts', key, 'dead'], true);
            bodyPart = newZombie.getIn(['bodyParts', key]);
          }

          if (bodyPart.get('isCritical') && bodyPart.get('dead')) {
            newZombie = newZombie.merge({
              dead: true,
              isMoving: false,
              takeBreak: false,
              isHunting: false
            });
          }

          if (bullet.charge <= 0) {
            return false;
          }
        });


        if (hasHit) {
          newZombie = newZombie.set('hitCount', newZombie.get('hitCount') + 1);
          SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), newZombie));
        }

        if (bullet.charge <= 0) {
          return false;
        }
      });

      if (changed) {
        ZombieStore.emitChange();
      }
      break;

    case CoreConstants.CORE_CONTINUE:
      break;

    case CoreConstants.CORE_POINT_PLACED:
      var zombie = SpotStore.getSpotById(action.props.get('zombieId'));
      var points = ZombieStore.getPointsByZombieId(action.props.get('zombieId'));

      if (!_$points[zombie.get('id')]) {
        _$points[zombie.get('id')] = {};
      }
      _$points[zombie.get('id')][action.props.get('pointId')] = action.$point;
      zombie = zombie.set('placedPointCount', zombie.get('placedPointCount') + 1);
      SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));

      if (zombie.get('placedPointCount') === 4) {
        zombie = zombie.set('movePointIndex', getNextMovePointIndex(zombie.get('movePointIndex')));
        SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));
        // start moving the zombie
        calculateMoveToPoint(
          zombie,
          getPointElementById(zombie, _movePointIdOrder[zombie.get('movePointIndex')])
        );
      }
      break;

    case Constants.ZOMBIE_REACHED_POINT:
      var zombie = SpotStore.getSpotById(action.id);
      if (zombie.get('isHunting')) {
        return calculateMoveToPoint(zombie, PlayerStore.getPlayerElement());
      }
      zombie = zombie.merge({
        isMoving: false,
        takeBreak: true,
        breakTimeout: Math.random() * 5000
      });
      SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));

      ZombieStore.emitChange();
      break;

    case Constants.ZOMBIE_BREAK_DONE:
      var zombie = SpotStore.getSpotById(action.id);
      if (zombie.get('isHunting')) {
        return calculateMoveToPoint(zombie, PlayerStore.getPlayerElement());
      }
      zombie = zombie.merge({
        movePointIndex: getNextMovePointIndex(zombie.get('movePointIndex')),
        isMoving: true,
        takeBreak: false
      });
      SpotService.updateSpots(SpotService.getSpots().set(zombie.get('id'), zombie));

      calculateMoveToPoint(
        zombie,
        getPointElementById(zombie, _movePointIdOrder[zombie.get('movePointIndex')])
      );
      ZombieStore.emitChange();
      break;

    case Constants.ZOMBIE_POSITION:
      var zombie = SpotStore.getSpotById(action.id);
      if (zombie.get('isHunting')) {
        return calculateMoveToPoint(zombie, PlayerStore.getPlayerElement());
      }
      var isPlayerInSight = PlayerDetection.isPlayerInSight(
        zombie.get('rotation'),
        MapStore.getMapHeading(),
        SpotStore.getSpotPosition(action.id),
        PlayerStore.getPlayerPosition()
      );

      if (!isPlayerInSight) {
        return;
      }

      setZombieHunting(zombie);
      ZombieStore.emitChange();
      break;

    case MapConstants.MAP_CENTER:
      var changed = false;
      SpotStore.getSpotsByName('zombie').forEach(function(spot) {
        if (spot.get('isHunting')) {
          return calculateMoveToPoint(spot, PlayerStore.getPlayerElement());
        }

        if (spot.get('hasAllPoints') || spot.get('hidden')) {
          return;
        }
        changed = true;
        _points = _points.concat(generatePoints(spot, SpotStore.getSpotElementById(spot.get('id'))));
      });

      if (changed) {
        ZombieStore.emitChange();
      }
      break;
  }

});


module.exports = ZombieStore;
