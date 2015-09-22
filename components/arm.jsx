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

var React = require('react');
var PureRenderMixin = React.addons.PureRenderMixin;
var ZombieActionCreators = require('zombie/actions/ZombieActionCreators');

module.exports = React.createClass({
  mixins: [PureRenderMixin],

  componentDidMount: function() {
    ZombieActionCreators.bodyPartMounted($(React.findDOMNode(this.refs.part)), this.props.part.get('id'), this.props.zombieId);
  },

  render: function() {
    console.log("--- arm render");
    return (
      <div className={"arm-" + this.props.position} ref="part"></div>
    );
  }
});
