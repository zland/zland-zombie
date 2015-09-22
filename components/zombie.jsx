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

require('jquery-translate3d');
require('zombie/sass/style');

var React = require('react');
var PureRenderMixin = React.addons.PureRenderMixin;
var Arm = require('./arm');
var Torso = require('./torso');
var Head = require('./head');
var math = require('core/math');
var SpotActionCreators = require('generatorSpot/actions/SpotActionCreators');
var ZombieActionCreators = require('zombie/actions/ZombieActionCreators');
var MapStore = require('map/stores/MapStore');
var SpotStore = require('generatorSpot/stores/SpotStore');
var ZombieStore = require('zombie/stores/ZombieStore');

var Zombie = React.createClass({

  intervalId: null,

  getStoreValues: function() {
    return {
      moveDiffX: MapStore.getMoveDiffX(),
      moveDiffY: MapStore.getMoveDiffY(),
      overallMoveDiffX: MapStore.getOverallMoveDiffX(),
      overallMoveDiffY: MapStore.getOverallMoveDiffY(),
      zombie: SpotStore.getSpotById(this.props.id)
    };
  },

  getInitialState: function() {
    return this.getStoreValues();
  },

  _onChange: function() {
    this.setState(this.getStoreValues());
  },

  shouldComponentUpdate: function(nextProps, nextState) {
    this.correctMoveDiff(nextState);

    if (this.state.zombie.get('dead') === false && nextState.zombie.get('dead') === true) {
      this.resetInterval();
      // animation?
      setTimeout((function() {
        ZombieActionCreators.died(this.state.zombie.get('id'));
        ZombieActionCreators.hit(this.state.zombie.get('id'));
      }).bind(this));
      return true;
    }

    if (this.state.zombie.get('dead')) {
      return false;
    }

    if (this.state.zombie.get('hitCount') !== nextState.zombie.get('hitCount')) {
      setTimeout((function() {
        ZombieActionCreators.hit(this.state.zombie.get('id'));
      }).bind(this));
    }

    if (nextState.zombie.get('rotation') !== 0) {
      this.$zombie.translate3d({rotate: nextState.zombie.get('rotation')});
    }

    if (nextState.zombie.get('isHunting') === true) {
      this.resetInterval();
      this.move();
    }

    if (this.state.zombie.get('takeBreak') === false && nextState.zombie.get('takeBreak') === true) {
      this.takeBreak();
    }

    if (!this.state.zombie.get('isMoving') && nextState.zombie.get('isMoving')) {
      this.move();
    }

    if (this.state.zombie.get('hidden') && !nextState.zombie.get('hidden')) {
      return true;
    }
    return false;
  },

  componentWillUnmount: function() {
    SpotStore.removeChangeListener(this._onChange);
    MapStore.removeChangeListener(this._onChange);
    ZombieStore.removeChangeListener(this._onChange);
    this.resetInterval();
  },

  componentDidMount: function() {
    SpotStore.addChangeListener(this._onChange);
    MapStore.addChangeListener(this._onChange);
    ZombieStore.addChangeListener(this._onChange);

    this.$zombie = $(React.findDOMNode(this.refs.zombie));
    SpotActionCreators.spotPlaced(this.state.zombie, this.$zombie);

    if (this.state.overallMoveDiffX !== 0 || this.state.overallMoveDiffY !== 0) {
      this.$zombie.translate3d({
        x: this.state.overallMoveDiffX,
        y: this.state.overallMoveDiffY
      });
    }
  },


  render: function() {
    console.log("--- zombie render");
    var styles = {
      top: this.state.zombie.get('top') + 'px',
      left: this.state.zombie.get('left') + 'px'
    };

    var cx = React.addons.classSet;
    var classes = cx({
      'spot': this.state.zombie.get('hidden'),
      'zombie': !this.state.zombie.get('hidden'),
      'dead': this.state.zombie.get('dead')
    });

    return (
      <div className={classes} ref="zombie" style={styles} data-zombie-id={this.state.zombie.get('id')}>
        <Arm position="left" part={this.state.zombie.get('bodyParts').get('armLeft')} zombieId={this.state.zombie.get('id')}/>
        <Arm position="right" part={this.state.zombie.get('bodyParts').get('armRight')} zombieId={this.state.zombie.get('id')}/>
        <Torso part={this.state.zombie.get('bodyParts').get('torso')} zombieId={this.state.zombie.get('id')}>
          <Head part={this.state.zombie.get('bodyParts').get('head')} zombieId={this.state.zombie.get('id')}/>
        </Torso>
      </div>
    );
  },

  /**
   *
   * custom methods
   *
   */
  resetInterval: function() {
    clearInterval(this.intervalId);
    clearTimeout(this.intervalId);
  },

  correctMoveDiff: function(props) {
    if (props.moveDiffX !== 0 || props.moveDiffY !== 0) {
      this.$zombie.translate3d({
        x: props.moveDiffX,
        y: props.moveDiffY
      });
    }
  },

  move: function() {
    var coveredDistance = {x: 0, y: 0};
    this.intervalId = setInterval((function() {
      this.$zombie.translate3d({
        x: this.state.zombie.get('moveX'),
        y: this.state.zombie.get('moveY')
      });

      // let the store know my position
      ZombieActionCreators.position(this.state.zombie.get('id'));

      if ((coveredDistance.x + this.state.zombie.get('distanceUnits').x) >= this.state.zombie.get('distance').x &&
          (coveredDistance.y + this.state.zombie.get('distanceUnits').y) >= this.state.zombie.get('distance').y) {
        clearInterval(this.intervalId);

        // let the store know that I've reached my target
        ZombieActionCreators.reachedPoint(this.state.zombie.get('id'));
        return;
      }
      coveredDistance.x += this.state.zombie.get('distanceUnits').x;
      coveredDistance.y += this.state.zombie.get('distanceUnits').y;
    }).bind(this), 33);
  },

  takeBreak: function() {
    this.intervalId = setTimeout((function() {
        ZombieActionCreators.breakDone(this.state.zombie.get('id'));
    }).bind(this), this.state.zombie.get('breakTimeout'));
  }
});

module.exports = Zombie;
