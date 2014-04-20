define(function(require) {
    var _ = require("underscore");

    function Task(imgUrl) {
        this.imgUrl = imgUrl;
        this._onload = null;
        this._onerror = null;
    }

    Task.prototype.onload = function(fn) {
        this._onload = fn;
        return this;
    };

    Task.prototype.onerror = function(fn) {
        this._onerror = fn;
        return this;
    };

    function Loader() {
        this.taskQueue = [];
        this.loading = false;
    };

    Loader.prototype.onTasksChanged = function() {
        if (this.loading) {
            return;
        }

        if (this.taskQueue.length === 0) {
            return;
        }

        this.loading = true;
        (function tick() {
            if (this.taskQueue.length === 0) {
                this.loading = false;
                return;
            }

            var task = this.taskQueue.shift();

            var image = new Image();
            image.src = task.imgUrl;

            image.onerror = _.bind(function() {
                if (_.isFunction(task._onerror)) {
                    task._onerror.call(null, image);
                }
                tick.call(this);
            }, this);

            image.onload = _.bind(function() {
                if (_.isFunction(task._onload)) {
                    task._onload.call(null, image);
                }
                tick.call(this);
            }, this);
        }).call(this);
    };

    Loader.prototype.load = function(imgUrl) {
        var task = new Task(imgUrl);
        this.taskQueue.push(task);
        this.onTasksChanged();
        
        return task;
    };

    Loader.prototype.cancel = function(task) {
        var index = this.taskQueue.indexOf(task)
        if (index === -1) {
            return;
        }

        this.taskQueue.splice(index, 1);
    }

    return new Loader();
});
