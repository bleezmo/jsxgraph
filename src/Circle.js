/*
    Copyright 2008,2009
        Matthias Ehmann,
        Michael Gerhaeuser,
        Carsten Miller,
        Bianca Valentin,
        Alfred Wassermann,
        Peter Wilfahrt

    This file is part of JSXGraph.

    JSXGraph is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    JSXGraph is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with JSXGraph.  If not, see <http://www.gnu.org/licenses/>.

*/
    
/**
 * @fileoverview The geometry object Circle is defined in this file. Circle stores all
 * style and functional properties that are required to draw and move a circle on
 * a board.
 * @author graphjs
 * @version 0.1
 */

/**
 * A circle consists of all points with a given distance from one point. This point is called center, the distance is called radius.
 * A circle can be constructed by providing a center and a point on the circle or a center and a radius (given as a number, function,
 * line, or circle). 
 * @class Creates a new circle object. Do not use this constructor to create a circle. Use {@link JXG.Board#create} with
 * type {@link Circle} instead.  
 * @constructor
 * @augments JXG.GeometryElement
 * @param {String,JXG.Board} board The board the new circle is drawn on.
 * @param {String} method Can be 
 * <ul><li> <b>'twoPoints'</b> which means the circle is defined by its center and a point on the circle.</li>
 * <li><b>'pointRadius'</b> which means the circle is defined by its center and its radius in user units</li>
 * <li><b>'pointLine'</b> which means the circle is defined by its center and its radius given by the distance from the startpoint and the endpoint of the line</li>
 * <li><b>'pointCircle'</b> which means the circle is defined by its center and its radius given by the radius of another circle</li></ul>
 * The parameters p1, p2 and radius must be set according to this method parameter.
 * @param {JXG.Point} p1 center of the circle.
 * @param {JXG.Point,JXG.Line,JXG.Circle} p2 Can be
 *<ul><li>a point on the circle if method is 'twoPoints'</li>
 <li>a line if the method is 'pointLine'</li>
 <li>a circle if the method is 'pointCircle'</li></ul>
 * @param {float} radius Only used when method is set to 'pointRadius'. Must be a given radius in user units.
 * @param {String} id Unique identifier for this object. If null or an empty string is given,
 * an unique id will be generated by Board
 * @param {String} name Not necessarily unique name. If null or an
 * empty string is given, an unique name will be generated.
 * @see JXG.Board#generateName
 */            

JXG.Circle = function (board, method, par1, par2, attributes) {
    /* Call the constructor of GeometryElement */
    this.constructor(board, attributes, JXG.OBJECT_TYPE_CIRCLE, JXG.OBJECT_CLASS_CIRCLE);


    //this.type = JXG.OBJECT_TYPE_CIRCLE;
    //this.elementClass = JXG.OBJECT_CLASS_CIRCLE;

    //this.init(board, attributes);
    
    /**
     * Stores the given method.
     * Can be 
     * <ul><li><b>'twoPoints'</b> which means the circle is defined by its center and a point on the circle.</li>
     * <li><b>'pointRadius'</b> which means the circle is defined by its center and its radius given in user units or as term.</li>
     * <li><b>'pointLine'</b> which means the circle is defined by its center and its radius given by the distance from the startpoint and the endpoint of the line.</li>
     * <li><b>'pointCircle'</b> which means the circle is defined by its center and its radius given by the radius of another circle.</li></ul>
     * @type string
     * @see #center
     * @see #point2
     * @see #radius
     * @see #line
     * @see #circle
     */
    this.method = method;

    // this is kept so existing code won't ne broken
    this.midpoint = JXG.getReference(this.board, par1);

    /**
     * The circles center. Do not set this parameter directly as it will break JSXGraph's update system.
     * @type JXG.Point
     */
    this.center = JXG.getReference(this.board, par1);
    
    /** Point on the circle only set if method equals 'twoPoints'. Do not set this parameter directly as it will break JSXGraph's update system.
     * @type JXG.Point
     * @see #method
     */
    this.point2 = null;
    
    /** Radius of the circle
     * only set if method equals 'pointRadius'
     * @type JXG.Point
     * @default null
     * @see #method     
     */    
    this.radius = 0;
    
    /** Line defining the radius of the circle given by the distance from the startpoint and the endpoint of the line
     * only set if method equals 'pointLine'. Do not set this parameter directly as it will break JSXGraph's update system.
     * @type JXG.Line
     * @default null
     * @see #method     
     */    
    this.line = null;
    
    /** Circle defining the radius of the circle given by the radius of the other circle
     * only set if method equals 'pointLine'. Do not set this parameter directly as it will break JSXGraph's update system.
     * @type JXG.Circle
     * @default null
     * @see #method     
     */     
    this.circle = null;

    if(method == 'twoPoints') {
        this.point2 = JXG.getReference(board,par2);
        // this.point2.addChild(this); // See below. Here, the id of this is not determined.
        this.radius = this.Radius(); 
    }
    else if(method == 'pointRadius') {
        this.gxtterm = par2;
        this.generateTerm(par2);  // Converts GEONExT syntax into JavaScript syntax
        this.updateRadius();                        // First evaluation of the graph  
    }
    else if(method == 'pointLine') {
        // dann ist p2 die Id eines Objekts vom Typ Line!
        this.line = JXG.getReference(board, par2);
        this.radius = this.line.point1.coords.distance(JXG.COORDS_BY_USER, this.line.point2.coords);    
    }
    else if(method == 'pointCircle') {
        // dann ist p2 die Id eines Objekts vom Typ Circle!
        this.circle = JXG.getReference(board, par2);
        this.radius = this.circle.Radius();     
    } 
    
    // create Label
    this.id = this.board.setId(this, 'C');
    this.board.renderer.drawEllipse(this);
    this.board.finalizeAdding(this);

    this.createGradient();
    this.elType = 'circle';
    this.createLabel();

    this.center.addChild(this);
    
    if(method == 'pointRadius') {
        this.notifyParents(par2);
    } else if(method == 'pointLine') {
        this.line.addChild(this);
    } else if(method == 'pointCircle') {
        this.circle.addChild(this);
    }  else if(method == 'twoPoints') {
        this.point2.addChild(this);
    }

    this.methodMap = JXG.deepCopy(this.methodMap, {
        setRadius: 'setRadius',
        getRadius: 'getRadius',
        radius: 'Radius'
    });
};
JXG.Circle.prototype = new JXG.GeometryElement;

JXG.extend(JXG.Circle.prototype, /** @lends JXG.Circle.prototype */ {

    /**
     * Checks whether (x,y) is near the circle.
     * @param {Number} x Coordinate in x direction, screen coordinates.
     * @param {Number} y Coordinate in y direction, screen coordinates.
     * @return {Boolean} True if (x,y) is near the circle, False otherwise.
     * @private
     */
    hasPoint: function (x, y) {
        var prec = this.board.options.precision.hasPoint/(this.board.unitX),
            mp = this.center.coords.usrCoords,
            p = new JXG.Coords(JXG.COORDS_BY_SCREEN, [x,y], this.board),
            r = this.Radius();

        var dist = Math.sqrt((mp[1]-p.usrCoords[1])*(mp[1]-p.usrCoords[1]) + (mp[2]-p.usrCoords[2])*(mp[2]-p.usrCoords[2]));
        return (Math.abs(dist-r) < prec);
        //return (dist <= r + prec);
    },

    /**
     * Used to generate a polynomial for a point p that lies on this circle.
     * @param p The point for that the polynomial is generated.
     * @return An array containing the generated polynomial.
     * @private
     */
    generatePolynomial: function (p) {
        /*
         * We have four methods to construct a circle:
         *   (a) Two points
         *   (b) center and radius
         *   (c) center and radius given by length of a segment
         *   (d) center and radius given by another circle
         *
         * In case (b) we have to distinguish two cases:
         *  (i)  radius is given as a number
         *  (ii) radius is given as a function
         * In the latter case there's no guarantee the radius depends on other geometry elements
         * in a polynomial way so this case has to be omitted.
         *
         * Another tricky case is case (d):
         * The radius depends on another circle so we have to cycle through the ancestors of each circle
         * until we reach one that's radius does not depend on another circles radius.
         *
         *
         * All cases (a) to (d) vary only in calculation of the radius. So the basic formulae for
         * a glider G (g1,g2) on a circle with center M (m1,m2) and radius r is just:
         *
         *     (g1-m1)^2 + (g2-m2)^2 - r^2 = 0
         *
         * So the easiest case is (b) with a fixed radius given as a number. The other two cases (a)
         * and (c) are quite the same: Euclidean distance between two points A (a1,a2) and B (b1,b2),
         * squared:
         *
         *     r^2 = (a1-b1)^2 + (a2-b2)^2
         *
         * For case (d) we have to cycle recursively through all defining circles and finally return the
         * formulae for calculating r^2. For that we use JXG.Circle.symbolic.generateRadiusSquared().
         */

        var m1 = this.center.symbolic.x;
        var m2 = this.center.symbolic.y;
        var g1 = p.symbolic.x;
        var g2 = p.symbolic.y;

        var rsq = this.generateRadiusSquared();

        /* No radius can be calculated (Case b.ii) */
        if (rsq == '')
            return [];

        var poly = '((' + g1 + ')-(' + m1 + '))^2 + ((' + g2 + ')-(' + m2 + '))^2 - (' + rsq + ')';
        return [poly];
    },

    /**
     * Generate symbolic radius calculation for loci determination with Groebner-Basis algorithm.
     * @type String
     * @return String containing symbolic calculation of the circle's radius or an empty string
     * if the radius can't be expressed in a polynomial equation.
     * @private
     */
    generateRadiusSquared: function () {
        /*
         * Four cases:
         *
         *   (a) Two points
         *   (b) center and radius
         *   (c) center and radius given by length of a segment
         *   (d) center and radius given by another circle
         */

        var rsq = '';

        if (this.method == "twoPoints") {
            var m1 = this.center.symbolic.x;
            var m2 = this.center.symbolic.y;
            var p1 = this.point2.symbolic.x;
            var p2 = this.point2.symbolic.y;

            rsq = '((' + p1 + ')-(' + m1 + '))^2 + ((' + p2 + ')-(' + m2 + '))^2';
        } else if (this.method == "pointRadius") {
            if (typeof(this.radius) == 'number')
                rsq = '' + this.radius*this.radius;
        } else if (this.method == "pointLine") {
            var p1 = this.line.point1.symbolic.x;
            var p2 = this.line.point1.symbolic.y;

            var q1 = this.line.point2.symbolic.x;
            var q2 = this.line.point2.symbolic.y;

            rsq = '((' + p1 + ')-(' + q1 + '))^2 + ((' + p2 + ')-(' + q2 + '))^2';
        } else if (this.method == "pointCircle") {
            rsq = this.circle.Radius();
        }

        return rsq;
    },

    /**
     * Uses the boards renderer to update the circle.
     */
    update: function () {
        if (this.needsUpdate) {
            if(this.visProp.trace) {
                this.cloneToBackground(true);
            }   

            if(this.method == 'pointLine') {
                this.radius = this.line.point1.coords.distance(JXG.COORDS_BY_USER, this.line.point2.coords);
            }
            else if(this.method == 'pointCircle') {
                this.radius = this.circle.Radius();
            }
            else if(this.method == 'pointRadius') {
                this.radius = this.updateRadius();
            }
            //if (true||!this.board.geonextCompatibilityMode) {
            this.updateStdform();
            this.updateQuadraticform();
            //}
        }
        return this;
    },

    /**
     * TODO description
     * @private
     */
    updateQuadraticform: function () {
        var m = this.center,
            mX = m.X(), mY = m.Y(), r = this.Radius();
        this.quadraticform = [[mX*mX+mY*mY-r*r,-mX,-mY],
            [-mX,1,0],
            [-mY,0,1]
        ];
    },

    /**
     * TODO description
     * @private
     */
    updateStdform: function () {
        this.stdform[3] = 0.5;
        this.stdform[4] = this.Radius();
        this.stdform[1] = -this.center.coords.usrCoords[1];
        this.stdform[2] = -this.center.coords.usrCoords[2];
        this.normalize();
    },

    /**
     * Uses the boards renderer to update the circle.
     * @private
     */
    updateRenderer: function () {
        if (this.needsUpdate && this.visProp.visible) {
            var wasReal = this.isReal;
            this.isReal = (isNaN(this.center.coords.usrCoords[1]+this.center.coords.usrCoords[2]+this.Radius()))?false:true;
            if (this.isReal) {
                if (wasReal!=this.isReal) {
                    this.board.renderer.show(this);
                    if(this.hasLabel && this.label.content.visProp.visible) this.board.renderer.show(this.label.content);
                }
                this.board.renderer.updateEllipse(this);
            } else {
                if (wasReal!=this.isReal) {
                    this.board.renderer.hide(this);
                    if(this.hasLabel && this.label.content.visProp.visible) this.board.renderer.hide(this.label.content);
                }
            }
            this.needsUpdate = false;
        }

        /* Update the label if visible. */
        if(this.hasLabel && this.label.content.visProp.visible && this.isReal) {
            //this.label.setCoordinates(this.coords);
            this.label.content.update();
            //this.board.renderer.updateLabel(this.label);
            this.board.renderer.updateText(this.label.content);
        }
    },

    /**
     * TODO description
     * @param term TODO type & description
     * @private
     */
    generateTerm: function (term) {
        if (typeof term=='string') {
            //var elements = this.board.elementsByName;
            // Convert GEONExT syntax into  JavaScript syntax
            //var newTerm = JXG.GeonextParser.geonext2JS(term+'', this.board);
            //this.updateRadius = new Function('return ' + newTerm + ';');
            this.updateRadius = this.board.jc.snippet(term, true, null, true);
        } else if (typeof term=='number') {
            this.updateRadius = function () { return term; };
        } else { // function
            this.updateRadius = term;
        }
    },

    /**
     * TODO description
     * @param contentStr TODO type&description
     * @private
     */
    notifyParents: function (contentStr) {
        var res = null;
        var elements = this.board.elementsByName;

        if (typeof contentStr == 'string')
            JXG.GeonextParser.findDependencies(this,contentStr+'',this.board);
    },

    /**
     * Set a new radius, then update the board.
     * @param {String|Number|function} r A string, function or number describing the new radius.
     * @returns {JXG.Circle} Reference to this circle
     */
    setRadius: function (r) {
        this.generateTerm(r);
        this.board.update();

        return this;
    },

    /**
     * Calculates the radius of the circle.
     * @param {String|Number|function} [value] Set new radius
     * @type Number
     * @return The radius of the circle
     */
    Radius: function (value) {
        if (JXG.exists(value)) {
            this.setRadius(value);
            return this.Radius();
        }

        if(this.method == 'twoPoints') {
            if (JXG.Math.Geometry.distance(this.point2.coords.usrCoords,[0,0,0])==0.0 || 
                JXG.Math.Geometry.distance(this.center.coords.usrCoords,[0,0,0])==0.0) {
                return NaN;
            } else {
                return this.center.Dist(this.point2);
            }
        }
        else if(this.method == 'pointLine' || this.method == 'pointCircle') {
            return this.radius;
        }
        else if(this.method == 'pointRadius') {
            return this.updateRadius();
        }
    },

    /**
     * @deprecated
     */
    getRadius: function () {
        return this.Radius();
    },

    // documented in geometry element
    getTextAnchor: function () {
        return this.center.coords;
    },

    // documented in geometry element
    getLabelAnchor: function () {
        var r = this.Radius(),
            c = this.center.coords.usrCoords,
            x, y;

        switch (this.visProp.label.position) {
            case 'lft':
                x = c[1] - r; y = c[2]; break;
            case 'llft':
                x = c[1] - Math.sqrt(0.5)*r; y = c[2] - Math.sqrt(0.5)*r; break;
            case 'rt':
                x = c[1] + r; y = c[2]; break;
            case 'lrt':
                x = c[1] + Math.sqrt(0.5)*r; y = c[2] - Math.sqrt(0.5)*r; break;
            case 'urt':
                x = c[1] + Math.sqrt(0.5)*r; y = c[2] + Math.sqrt(0.5)*r; break;
            case 'top':
                x = c[1]; y = c[2] + r; break;
            case 'bot':
                x = c[1]; y = c[2] - r; break;
            case 'ulft':
            default:
                x = c[1] - Math.sqrt(0.5)*r; y = c[2] + Math.sqrt(0.5)*r; break;
        }
        return  new JXG.Coords(JXG.COORDS_BY_USER, [x, y], this.board);
    },


    // documented in geometry element
    cloneToBackground: function () {
        var copy = {}, r, er;
        copy.id = this.id + 'T' + this.numTraces;
        copy.elementClass = JXG.OBJECT_CLASS_CIRCLE;
        this.numTraces++;
        copy.center = {};
        copy.center.coords = this.center.coords;
        r = this.Radius();
        copy.Radius = function () { return r; };
        copy.getRadius = function () { return r; }; // deprecated

        copy.board = this.board;

        copy.visProp = JXG.deepCopy(this.visProp, this.visProp.traceattributes, true);
        copy.visProp.layer = this.board.options.layer.trace;
        JXG.clearVisPropOld(copy);

        er = this.board.renderer.enhancedRendering;
        this.board.renderer.enhancedRendering = true;
        this.board.renderer.drawEllipse(copy);
        this.board.renderer.enhancedRendering = er;
        this.traces[copy.id] = copy.rendNode;

        return this;
    },

    /**
     * Add transformations to this circle.
     * @param {JXG.Transform|Array} transform Either one {@link JXG.Transform} or an array of {@link JXG.Transform}s.
     * @returns {JXG.Circle} Reference to this circle object.
     */
    addTransform: function (transform) {
        var i,
            list = JXG.isArray(transform) ? transform : [transform],
            len = list.length;

        for (i = 0; i < len; i++) {
            this.center.transformations.push(list[i]);
            if (this.method === 'twoPoints') {
                this.point2.transformations.push(list[i]);
            }
        }
        
        return this;
    },

    /**
     * TODO description
     * @param method TODO
     * @param coords TODO
     * @private
     */
    setPosition: function (method, coords) {
        var t;

        coords = new JXG.Coords(method, coords, this.board);
        t = this.board.create('transform', coords.usrCoords.slice(1), {type:'translate'});
        this.addTransform(t);

        return this;
    },

    /**
     * Sets x and y coordinate and calls the circle's update() method.
     * @param {number} method The type of coordinates used here. Possible values are {@link JXG.COORDS_BY_USER} and {@link JXG.COORDS_BY_SCREEN}.
     * @param {Array} coords coordinate in screen/user units
     * @param {Array} oldcoords previous coordinate in screen/user units
     * @returns {JXG.Circle} Reference to this circle.
     */
    setPositionDirectly: function (method, coords, oldcoords) {
        coords = new JXG.Coords(method, coords, this.board);
        oldcoords = new JXG.Coords(method, oldcoords, this.board);

        var diffc = JXG.Math.Statistics.subtract(coords.usrCoords, oldcoords.usrCoords),
            len = this.parents.length, i, p;

        for (i = 0; i < len; i++) {
            if (!JXG.getRef(this.board, this.parents[i]).draggable()) {
                return this;
            }
        }
        
        for (i = 0; i < len; i++) {
            p = JXG.getRef(this.board, this.parents[i]);
            p.setPositionDirectly(JXG.COORDS_BY_USER, JXG.Math.Statistics.add(p.coords.usrCoords, diffc));
        }
        
        this.update();
        return this;
    },
    
    /**
     * Treats the circle as parametric curve and calculates its X coordinate.
     * @param {Number} t Number between 0 and 1.
     * @returns {Number} <tt>X(t)= radius*cos(t)+centerX</tt>.
     */
    X: function (t) {
        return this.Radius()*Math.cos(t*2.0*Math.PI)+this.center.coords.usrCoords[1];
    },

    /**
     * Treats the circle as parametric curve and calculates its Y coordinate.
     * @param {Number} t Number between 0 and 1.
     * @returns {Number} <tt>X(t)= radius*sin(t)+centerY</tt>.
     */
    Y: function (t) {
        return this.Radius()*Math.sin(t*2.0*Math.PI)+this.center.coords.usrCoords[2];
    },

    /**
     * Treat the circle as parametric curve and calculates its Z coordinate.
     * @param {Number} t ignored
     * @return {Number} 1.0
     */
    Z: function (t) {
        return 1.0;
    },

    /**
     * TODO description
     * @private
     */
    minX: function () {
        return 0.0;
    },

    /**
     * TODO description
     * @private
     */
    maxX: function () {
        return 1.0;
    },

    Area: function () {
        var r = this.Radius();
        return r*r*Math.PI;
    },

    bounds: function () {
        var uc = this.center.coords.usrCoords,
            r = this.Radius();

        return [uc[1] - r, uc[2] + r, uc[1] + r, uc[2] - r];
    }
});

/**
 * @class This element is used to provide a constructor for a circle. 
 * @pseudo
 * @description  A circle consists of all points with a given distance from one point. This point is called center, the distance is called radius.
 * A circle can be constructed by providing a center and a point on the circle or a center and a radius (given as a number, function,
 * line, or circle). 
 * @name Circle
 * @augments JXG.Circle
 * @constructor
 * @type JXG.Circle
 * @throws {Exception} If the element cannot be constructed with the given parent objects an exception is thrown.
 * @param {JXG.Point_number,JXG.Point,JXG.Line,JXG.Circle} center,radius The center must be given as a {@link JXG.Point}, but the radius can be given
 * as a number (which will create a circle with a fixed radius), another {@link JXG.Point}, a {@link JXG.Line} (the distance of start and end point of the
 * line will determine the radius), or another {@link JXG.Circle}.
 * @example
 * // Create a circle providing two points
 * var p1 = board.create('point', [2.0, 2.0]);
 * var p2 = board.create('point', [2.0, 0.0]);
 * var c1 = board.create('circle', [p1, p2]);
 * 
 * // Create another circle using the above circle
 * var p3 = board.create('point', [3.0, 2.0]);
 * var c2 = board.create('circle', [p3, c1]);
 * </pre><div id="5f304d31-ef20-4a8e-9c0e-ea1a2b6c79e0" style="width: 400px; height: 400px;"></div>
 * <script type="text/javascript">
 *   var cex1_board = JXG.JSXGraph.initBoard('5f304d31-ef20-4a8e-9c0e-ea1a2b6c79e0', {boundingbox: [-1, 9, 9, -1], axis: true, showcopyright: false, shownavigation: false});
 *   var cex1_p1 = cex1_board.create('point', [2.0, 2.0]);
 *   var cex1_p2 = cex1_board.create('point', [2.0, 0.0]);
 *   var cex1_c1 = cex1_board.create('circle', [cex1_p1, cex1_p2]);
 *   var cex1_p3 = cex1_board.create('point', [3.0, 2.0]);
 *   var cex1_c2 = cex1_board.create('circle', [cex1_p3, cex1_c1]);
 * </script><pre>
 */
JXG.createCircle = function (board, parents, attributes) {
    var el, p, i, attr, isDraggable = true;

    p = [];
    for (i=0;i<parents.length;i++) {
        if (JXG.isPoint(parents[i])) {
            p[i] = parents[i];              // Point
        } else if (JXG.isArray(parents[i]) && parents[i].length>1) {
            attr = JXG.copyAttributes(attributes, board.options, 'circle', 'center');
            p[i] = board.create('point', parents[i], attr);  // Coordinates
        } else {
            p[i] = parents[i];              // Something else (number, function, string)
        }
    }
    
    attr = JXG.copyAttributes(attributes, board.options, 'circle');
   
    if( parents.length==2 && JXG.isPoint(p[0]) && JXG.isPoint(p[1]) ) {
        // Point/Point
        el = new JXG.Circle(board, 'twoPoints', p[0], p[1], attr);
    } else if( ( JXG.isNumber(p[0]) || JXG.isFunction(p[0]) || JXG.isString(p[0])) && JXG.isPoint(p[1]) ) {
        // Number/Point
        el = new JXG.Circle(board, 'pointRadius', p[1], p[0], attr);
    } else if( ( JXG.isNumber(p[1]) || JXG.isFunction(p[1]) || JXG.isString(p[1])) && JXG.isPoint(p[0]) ) {
        // Point/Number
        el = new JXG.Circle(board, 'pointRadius', p[0], p[1], attr);
    } else if( (p[0].elementClass == JXG.OBJECT_CLASS_CIRCLE) && JXG.isPoint(p[1]) ) {
        // Circle/Point
        el = new JXG.Circle(board, 'pointCircle', p[1], p[0], attr);
    } else if( (p[1].elementClass == JXG.OBJECT_CLASS_CIRCLE) && JXG.isPoint(p[0])) {
        // Point/Circle
        el = new JXG.Circle(board, 'pointCircle', p[0], p[1], attr);
    } else if( (p[0].elementClass == JXG.OBJECT_CLASS_LINE) && JXG.isPoint(p[1])) {
        // Line/Point
        el = new JXG.Circle(board, 'pointLine', p[1], p[0], attr);
    } else if( (p[1].elementClass == JXG.OBJECT_CLASS_LINE) && JXG.isPoint(p[0])) {
        // Point/Line
        el = new JXG.Circle(board, 'pointLine', p[0], p[1], attr);
    } else if( parents.length==3 && JXG.isPoint(p[0]) && JXG.isPoint(p[1]) && JXG.isPoint(p[2])) {
        // Circle through three points
        el = JXG.createCircumcircle(board, p, attributes);
        //el.center.setProperty({visible:false});
        //isDraggable = false;
    } else
        throw new Error("JSXGraph: Can't create circle with parent types '" + 
                        (typeof parents[0]) + "' and '" + (typeof parents[1]) + "'." +
                        "\nPossible parent types: [point,point], [point,number], [point,function], [point,circle], [point,point,point]");
    
    el.isDraggable = isDraggable;

    el.parents = [];
    for (i = 0; i < parents.length; i++) {
        if (parents[i].id) {
            el.parents.push(parents[i].id);
        }
    }
    
    el.elType = 'circle';
    return el;
};

JXG.JSXGraph.registerElement('circle', JXG.createCircle);
