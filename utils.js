module.exports = ($timeout) => {
	'ngInject'

	function isArray(arr) {
		if (Array.isArray) {
			return Array.isArray(arr)
		}
		return Array.prototype.toString.call(Array) == '[object Array]'
	}

	function unique(arr) {
		if (! isArray(arr)) {
			return []
		}
		return arr.filter(function (item, key) { return arr.indexOf(item) == key })
	}

	function dateNumToStr(year, month, day) {
		return year + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2)
	}

	function dateStrToNum(str) {
		return str.split('-').map(function (item) { return parseInt(trimStart(item, 0)) })
	}

	function trim(str, needle) {
		str = trimStart(str, needle)
		str = trimEnd(str, needle)
		return str
	}

	function trimStart(str, needle) {
		return str.replace(new RegExp('^(' + needle + ')+'), '')
	}

	function trimEnd(str, needle) {
		return str.replace(new RegExp('(' + needle + ')+$'), '')
	}

	function toPath(str) {
		return str.split('.')
	}

	function get(obj, str, defaultValue) {
		try {
			var value = toPath(str).reduce(function (o, p) { return o[p] }, obj)
			return value === undefined ? defaultValue : value
		} catch (e) {
			return defaultValue
		}
	}

	function invoke(obj, path/* args */) {
		var fn = get(obj, path)
		if (isUndefined(fn)) return undefined
		if (!isFunction(fn)) throw new Error('invoke path error')
		// XXX obj
		fn.apply(obj, [].slice.call(arguments, 2))
	}

	function isUndefined(obj) {
		return obj === undefined
	}

	function isFunction(fn) {
		return typeof fn == 'function'
	}

	function isNull(obj) {
		return obj === null
	}

	function validator(fn, err) {
		return (value, on) => {
			if (isUndefined(on)) on = true
			if (!on) return [true, '']
			return fn(value) ? [true, ''] : [false, err]
		}
	}

	function validators() {
		var funcs = [].slice.call(arguments)
		return (value, on) => {
			if (isUndefined(on)) on = true
			if (!on) return [true, '']
			return funcs.reduce((r, f) => r[0] ? f(value) : r, [true, ''])
		}
	}

	function validate() {
		var validators = [].slice.call(arguments)
		return validators.reduce((r, i) => r[0] ? i : r, [true, ''])
	}

	function set(o, k, v) {
		// XXX
		o[k] = v
		return o
	}

	// XXX
	function memoize(fn, hasher) {
		var cache = {}
		if (!isFunction(hasher)) {
			hasher = function () {
				var args = [].slice.call(arguments)
				return args.length ? args[0].toString() : ''
			}
		}

		var closure = function (/* args */) {
			var args = [].slice.call(arguments)
			var key = hasher.apply(null, args)
			if (cache.hasOwnProperty(key)) return cache[key]
			cache[key] = fn(args)
			return cache[key]
		}

		closure.clear = () => {
			cache = {}
		}

		return closure
	}

	// XXX
	function once(fn) {
		var isCalled = false
		var result = null
		return function (/* args */) {
			if (isCalled) return result
			var args = [].slice.call(arguments)
			result = fn(args)
			return result
		}
	}

	// XXX
	function debounce(fn, wait) {
		var t = null
		return function (/* args */) {
			var args = [].slice.call(arguments)
			$timeout.cancel(t)
			t = $timeout(() => {
				fn.apply(null, args)
				t = null
			}, wait)
		}
	}

	function inherit(subClass, superClass) {
		subClass.prototype = Object.create(superClass.prototype)
		subClass.prototype.constructor = subClass
		subClass.superClass = superClass
	}

	function range(start, end) {
		return Array(end - start).fill().map((v, k) => start + k)
	}

	return {
		isArray: isArray,
		unique: unique,
		dateNumToStr: dateNumToStr,
		trim: trim,
		dateStrToNum: dateStrToNum,
		trimStart: trimStart,
		trimEnd: trimEnd,
		get: get,
		invoke: invoke,
		isUndefined: isUndefined,
		isFunction: isFunction,
		validator: validator,
		validators: validators,
		debounce: debounce,
		validate: validate,
		inherit: inherit,
		range: range
	}
}