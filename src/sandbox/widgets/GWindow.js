define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/fx',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/aspect',
  'dojo/on',
  'dojo/Deferred',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'dojo/text!./templates/GWindowTemplate.html'
], function (declare, lang, baseFx, domAttr, domConstruct, domStyle, aspect,
  on, Deferred, _WidgetBase, _TemplatedMixin, template) {
  'use strict';

  var GWindow = declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,

    /* attach points */
    titleBar: null,
    titleDiv: null,
    windowShade: null,
    panelNode: null,

    constructor: function(kwargs) {
      lang.mixin(this, kwargs);

      this.attrs = this.attrs || {};
      this.isMinimized = this.isMinimized !== undefined ? this.isMinimized : false;
      this.title = this.title || 'Window' + GWindow.count++;
      this.content = this.content || null;
      this.autoMinimize = this.autoMinimize !== undefined ? this.autoMinimize : true;
    },

    postCreate: function() {
      var node = this.panelNode;

      domAttr.set(this.domNode, this.attrs);
      this.content && this.setContent(this.content);
      this.isMinimized ? _initHideAnimation(node).play() : _showFunc(node);
      this.showAnimation = (this.showAnimation || _showAnimation)(node);
      this.hideAnimation = (this.hideAnimation || _hideAnimation)(node);

      if(this.autoMinimize) { this.createListeners(); }
    },

    _afterAnimFunc: function() {
      this.titleBarListener && this.titleBarListener.resume();
      this.__deferred.resolve();
      this.__deferred = null;
    },

    _beforeAnimFunc: function(anim) {
      this.titleBarListener && this.titleBarListener.pause();
      this.__deferred = new Deferred();
      anim.play();
      this.isMinimized = !this.isMinimized;

      return this.__deferred.promise;
    },

    createListeners: function() {
      this.titleBarListener = on.pausable(this.titleBar, 'click', this.toggle.bind(this));
      this.own(this.titleBarListener);

      aspect.after(this.showAnimation, 'onEnd', this._afterAnimFunc.bind(this));
      aspect.after(this.hideAnimation, 'onEnd', this._afterAnimFunc.bind(this));
    },

    toggle: function(/* e */) {
      return this.isMinimized ? this.show() : this.hide();
    },

    show: function() {
      return this._beforeAnimFunc(this.showAnimation);
    },

    hide: function() {
      return this._beforeAnimFunc(this.hideAnimation);
    },

    setTitle: function(title) {
      this.titleDiv.innerHTML = title;
      this.title = title;
    },

    setContent: function(node) {
      this.empty();
      domConstruct.place(node, this.containerNode);
    },

    addContent: function(nodes) {
      var that = this;
      nodes = lang.isArray(nodes) ? nodes : [nodes];

      nodes.forEach(function(node) {
        domConstruct.place(node, that.containerNode);
      });
    },

    empty: function() {
      domConstruct.empty(this.containerNode);
    },

    panelHeight: function() {
      return domStyle.get(this.panelNode, 'height');
    },

    contentHeight: function() {
      return domStyle.get(this.containerNode, 'height');
    }
  });

  GWindow.count = 0;

  function _initHideAnimation(n) {
    return _baseAnimation(_slideUpFunc, 0, { onEnd: _showFunc })(n);
  }

  function _showAnimation(n) {
    return _baseAnimation(_slideDownFunc, 300)(n);
  }

  function _hideAnimation(n) {
    return _baseAnimation(_slideUpFunc, 300)(n);
  }

  function _baseAnimation(moveFunc, duration, mixins) {
    return function(n) {
      return baseFx.animateProperty(lang.mixin({
        node: n,
        properties: {
          top: moveFunc
        },
        duration: duration
      }, mixins));
    };
  }

  function _slideDownFunc(n) {
    return { end: domStyle.get(n, 'top') + domStyle.get(n, 'height') };
  }

  function _slideUpFunc(n) {
    return { end: domStyle.get(n, 'top') - domStyle.get(n, 'height') };
  }

  function _showFunc(n) {
    domStyle.set(n, 'display', 'block');
  }

  return GWindow;
});
