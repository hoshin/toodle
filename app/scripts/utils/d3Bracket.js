'use strict';
var D3Bracket = function () {
};
var _ = require('../../../node_modules/lodash/lodash.js');

D3Bracket.prototype.convertBracketToD3Tree = function (bracket, debug) {
    var transformedBracket = {};

    var root = _.find(bracket, function (item) {
        return item.next == null;
    });
    if (root) {
        transformedBracket = insertNodes(root, bracket);
    }
    return transformedBracket;
};

//recursively runs through the bracket until initial matches are found,
// then places these matches in the "children" array of their upcoming match
// in the tree structure, and so on
function insertNodes(currentNode, bracket) {
    var children = _.filter(bracket, function (item) {
        return currentNode.number == item.next;
    });
    var result = {};
    var previousMatches = _.filter(bracket, function(item){return item.next == currentNode.number});

    result.player1 = currentNode.player1;
    result.player2 = currentNode.player2;
    result.name = currentNode.number;
    result.parent = currentNode.next || 'null';
    result.complete = currentNode.complete;
    result.canReport = !currentNode.complete && _.every(previousMatches, function(item){return item.complete});
    result.score1 = currentNode.score1;
    result.score2 = currentNode.score2;

    if (children.length) {
        result.children = [];
        _.forEach(children, function (child) {
            result.children.push(insertNodes(child, bracket));
        });
    }
    return result;
};

D3Bracket.prototype.WIDTH = 1400;
D3Bracket.prototype.HEIGHT = 700;
var NODE_TEXT_LEFT_MARGIN = 10;

var NODE_WIDTH = 150;
var NODE_HEIGHT = 40;
var TEXT_IN_NODE_VALIGN_TOP = -5;
var TEXT_IN_NODE_VALIGN_BOTTOM = 15;
var NODE_FILL_COLOR = '#fff';
var NODE_INNER_SEPARATION_COLOR = '#ddd';
var NODE_OUTER_COLOR = '#aad';

var TREE_LEVELS_HORIZONTAL_DEPTH = 400;


D3Bracket.prototype.drawSingleNode = function(nodeEnter, lineFunction) {
    var lineData = [
        {x: 0, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: -NODE_HEIGHT / 2},
        {x: NODE_WIDTH, y: NODE_HEIGHT / 2},
        {x: 0, y: NODE_HEIGHT / 2},
        {x: 0, y: -NODE_HEIGHT / 2}
    ];
    nodeEnter.append("path")
        .attr("d", lineFunction(lineData))
        .attr("stroke", NODE_OUTER_COLOR)
        .attr('stroke-width', 2)
        .attr('fill', NODE_FILL_COLOR);

    nodeEnter.append("path")
        .attr("d", lineFunction([
            {x: 0, y: 0},
            {x: NODE_WIDTH, y: 0}
        ]))
        .attr("stroke", NODE_INNER_SEPARATION_COLOR)
        .attr('stroke-width', 1);
};

D3Bracket.prototype.getTextToDraw = function(d, player1){
    var playerData = player1 ? d.player1 : d.player2;
    var playerScore = player1 ? d.score1 : d.score2;
    var playerName = playerData ? playerData.name : 'TBD';
    return playerScore || playerScore == 0 ? playerScore + ' ' +playerName : ' -  ' +playerName;
};
D3Bracket.prototype.drawPlayerNameInNode = function(node, player1) {
    var that = this;
    node.append("text")
        .attr("x", function (d) {
            return  NODE_TEXT_LEFT_MARGIN;
        })
        .attr("y", function (d) {
            return player1 ? TEXT_IN_NODE_VALIGN_TOP : TEXT_IN_NODE_VALIGN_BOTTOM;
        })
        .attr("text-anchor", function (d) {
            return "start";
        })
        .text(function (d) {
            return that.getTextToDraw(d, player1);
        })
        .style("fill-opacity", 1);
};

D3Bracket.prototype.drawLinesBetweenNodes = function(svg, links, diagonal) {
    var link = svg.selectAll("path.link")
        .data(links, function (d) {
            return d.target.id;
        });
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", diagonal);
};
D3Bracket.prototype.drawLine = function(d3) {
    var lineFunction = d3.svg.line().
        x(function (d) {
            return d.x
        }).
        y(function (d) {
            return d.y
        }).
        interpolate('linerar');
    return lineFunction;
};
D3Bracket.prototype.translateOrigin = function(node) {
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });
    return nodeEnter;
};
D3Bracket.prototype.giveAnIdToEachNode = function(svg, nodes) {
    var i = 0;
    var node = svg.selectAll("g.node")
        .data(nodes, function (d) {
            return d.id || (d.id = ++i);
        });
    return node;
};
D3Bracket.prototype.appendSvgCanvas = function(margin, d3) {
    var svg = d3.select("#bracket").append("svg")
        .attr("width", this.WIDTH + margin.right + margin.left)
        .attr("height", this.HEIGHT + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    return svg;
};
D3Bracket.prototype.getWidth = function(){
    return this.WIDTH;
};
D3Bracket.prototype.getHeight = function(){
    return this.HEIGHT;
};
D3Bracket.prototype.setViewDimensions = function(bracket){
    var numPlayers = _.keys(bracket).length;
    var depth = Math.log(numPlayers+1)/Math.log(2);
    //debugger;
    this.WIDTH = 400*Math.round(depth);
    if(numPlayers < 32){
        this.HEIGHT = this.WIDTH/2;
    } else if(numPlayers < 127){
        this.HEIGHT = this.WIDTH*Math.round(depth/2);
    } else {
        this.HEIGHT = this.WIDTH*Math.ceil(depth);
    }
};
D3Bracket.prototype.drawBracket = function (bracket, d3) {
    var d3Nodes = this.convertBracketToD3Tree(bracket);
    var that = this;
    this.setViewDimensions(bracket);
    var tree = d3.layout.tree()
        .size([this.HEIGHT, this.WIDTH]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var nodes = tree.nodes(d3Nodes).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = that.WIDTH-200-d.depth * TREE_LEVELS_HORIZONTAL_DEPTH;
        d.x = d.x;
    });

    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var svg = this.appendSvgCanvas(margin, d3);
    var node = this.translateOrigin(this.giveAnIdToEachNode(svg, nodes));

    this.drawSingleNode(node, this.drawLine(d3));
    this.drawPlayerNameInNode(node, true);
    this.drawPlayerNameInNode(node, false);
    this.drawLinesBetweenNodes(svg, links, diagonal);
};

module.exports.D3Bracket = D3Bracket;