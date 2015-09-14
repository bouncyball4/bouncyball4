var BBP = {
	loadPiece: function(j) {
		return new this.pieces[j.type](j);
	},
	pieces: {},
	stubs: {
		basicConstruct: function(n) {
			BBP.pieces[n] = function(j) {
				this.x = j.x;
				this.y = j.y;
				this.w = j.w;
				this.h = j.h;
			};
		},
		get: function(n, v, i) {
			BBP.pieces[n].prototype["get"+v] = function() {
				return this[i];
			};
		}
	}
};
BBP.stubs.basicConstruct('woodblock');
BBP.pieces.woodblock.prototype.draw = function(ctx) {
	ctx.fillStyle="black";
	ctx.fillRect(this.x, this.y, this.w, this.h);
};
BBP.stubs.get('woodblock', 'Width', 'w');
BBP.stubs.get('woodblock', 'Height', 'h');
BBP.stubs.get('woodblock', 'X', 'x');
BBP.stubs.get('woodblock', 'Y', 'y');
