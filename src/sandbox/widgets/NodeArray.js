define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-attr',
  'dojo/dom-construct',
  'dojo/dom-style',
  'dojo/on',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',

  'dojo/text!./templates/NodeArrayTemplate.html'
], function (declare, lang, domAttr, domConstruct, domStyle, on,
  _WidgetBase, _TemplatedMixin, template) {
  'use strict';

  var NodeArray = declare([_WidgetBase, _TemplatedMixin], {

    templateString: template,
    nodeArr: [],

    constructor: function(kwargs) {
      lang.mixin(this, kwargs);

      this.attrs = this.attrs || {};
      this.initItems = this.initItems || null;
      this.createNode = this.createNode || _createNode;

      this.dataAttr = 'data-nodearray' + NodeArray.count++ + '-index';
    },

    postCreate: function() {
      domAttr.set(this.domNode, this.attrs);

      !!this.initItems && this.push(this.initItems);
      this.initItems = null;
    },

    push: function(params) {
      var node, arr = this.nodeArr;

      _makeArray(params).forEach(function(param) {
        node = this._makeNode(param, arr.length);
        domConstruct.place(node, this.containerNode);
        arr.push(node);
      }, this);
    },

    insert: function(index, param) {
      var node, arr = this.nodeArr, len = arr.length;

      index = index < 0 ? 0 : index >= len ? len : index;

      if(index >= len) {
        this.push(param);
      } else {
        node = this._makeNode(param, index);
        domConstruct.place(node, arr[index], 'before');
        arr.splice(index, 0, node);
      	_reindexFrom(arr, index + 1);
      }


    },

    remove: function(indices) {
      var i, index, mindex = Number.MAX_VALUE, arr = this.nodeArr;

      indices = _makeArray(indices).sort(function(a, b) { return a - b; });
      i = indices.length;

      while(i-- > 0) {
        index = indices[i];

        if(!this._validIndex(index)) { continue; }

        arr[index].remove();
        arr.splice(index, 1);
        mindex = Math.min(mindex, index);
      }

      _reindexFrom(arr, mindex);
    },

    get: function(index) {
      return this._validIndex(index) ? this.nodeArr[index] : null;
    },

    indexOf: function(node) {
      var index = parseInt(domAttr.get(node, this.dataAttr), 10);

      return !isNaN(index) && this._validIndex(index) ? index : -1;
    },

    itemEventListener: function(event, callback, thisArg) {
      var that = this, slctr = '[' + this.dataAttr + ']';
      thisArg = thisArg || this;

      this.own(on(this.domNode, on.selector(slctr, event), function(e) {
        var index = that.indexOf(e.target);

        callback.call(thisArg, that.nodeArr[index], index, e);
      }));
    },

    iterate: function(callback, thisArg) {
      thisArg = thisArg || this;

      this.nodeArr.forEach(function(node, index, arr) {
        callback(node, index, arr);
      }, thisArg);
    },

    _makeNode: function(param, index) {
      var node = this.createNode(param);
      domAttr.set(node, this.dataAttr, index);

      return node;
    },

    _validIndex: function(index) {
      return index > -1 && index < this.nodeArr.length;
    }
  });

  NodeArray.count = 0;

  function _reindexFrom(arr, index) {
    for(var i = index, leni = arr.length; i < leni; i++) {
      domAttr.set(arr[i], this.dataAttr, i);
    }
  }

  function _makeArray(value) {
    return lang.isArray(value) ? value : [value];
  }

  function _createNode() {
    return domConstruct.create('div');
  }

  return NodeArray;
});
