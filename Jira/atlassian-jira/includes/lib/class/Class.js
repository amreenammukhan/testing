// Inspired by base2 and Prototype
define('jira/lib/class', [
    'jira/util/objects',
    'jquery'
], function(
    Objects,
    $
) {
    var initializing = false;

    var fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;    

    /**
     * The base Class implementation (does nothing)
     * @exports jira/lib/class
     * @class Class
     * @alias Klass
     */
    var Class = function() {
        const events = {}
        
        this._subscribeToEvent = (function() {
            return function (event, cb) {
                if (!events[event]) {
                    events[event] = [];
                }

                events[event].push(cb)
            } 
        })()

        this._publishEvent = function (event, args) {
            if (events[event]) {
                for (const cb of events[event]) {
                    cb(args);
                }
            }
        }
    };

    /**
     * Create a new Class that inherits from this class.
     *
     * @example
     * var Vehicle = Class.extend({
     *     drive: function() { ... }
     * });
     * var Car = Vehicle.extend({ ... });
     *
     * var myCar = new Car();
     * myCar.drive();
     *
     * @return {Klass}
     * @function Klass.extend
     */
    Class.extend = function() {

        var prop;

        var _super = this.prototype;

        if (arguments.length > 1) {

            var interfaces = $.makeArray(arguments);

            prop = interfaces.pop();

            var completeInterface;

            $.each(interfaces, function (i, inter) {
                if (completeInterface) {
                    completeInterface = completeInterface.extend(inter);
                } else {
                    completeInterface = inter;
                }
            });

            return completeInterface.extend(this.prototype).extend(prop);

        } else {
            prop = arguments[0];
        }

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function

            if (prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name])) {
                prototype[name] = (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]);
            } else if (typeof _super[name] === "object") {
                var newObj = Objects.begetObject(prop[name]);

                $.each(_super[name], function (name, obj) {
                    if (!newObj[name]) {
                        newObj[name] = obj;
                    } else if (typeof newObj[name] === "object") {
                        var newSubObj = Objects.begetObject(newObj[name]);
                        $.each(obj, function (subName, subObj) {
                            if (!newSubObj[subName]) {
                                newSubObj[subName] = subObj;
                            }
                        });
                        newObj[name] = newSubObj;
                    }
                });

                prototype[name] = newObj;
            } else {
                prototype[name] = prop[name];
            }
        }

        /**
         * The dummy class constructor
         * @ignore
         */
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init)
                this.init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.fn = Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.constructor = Class;

        // And make this class extensible
        Class.extend = arguments.callee;

        return Class;
    };

    // additional methods on the base Class.

    /**
     * Binds event on instance
     *
     * @param {String} evt - Event Name
     * @param {function} func
     * @function Klass#bind
     */
    Class.prototype.bind = function (evt, func) {
        $(this).bind(evt, func);
        return this;
    };

    /**
     * Used to fire custom events on instance.
     *
     * @param {String} event -- The name of the event to trigger.
     * @function Klass#trigger
     */
    Class.prototype.trigger = function(event) {
        var instance = $(this);
        var args = [].slice.call(arguments, 1);
        this._publishEvent(event, args);
        event = new $.Event(event);
        args.unshift(event);
        instance.trigger.apply(instance, args);
        return !event.isDefaultPrevented();
    };

    /**
     * Listen to custom events on instance
     *
     * @param {String} event -- The name of the event to trigger.
     * @param {Function} callback -- Callback to trigger.
     * @function Klass#on
     */
    Class.prototype.on = function(event, callback) {
        this._subscribeToEvent(event, callback)
    }

    return Class;
});

AJS.namespace('Class', null, require('jira/lib/class'));
