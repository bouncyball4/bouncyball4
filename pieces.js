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
		basicConstructMoving: function(n, xv, yv) {
			BBP.pieces[n] = function(j) {
				this.x = j.x;
				this.y = j.y;
				this.w = j.w;
				this.h = j.h;
				this.xv = xv;
				this.yv = yv;
			};
		},
		get: function(n, v, i) {
			BBP.pieces[n].prototype["get"+v] = function() {
				return this[i];
			};
		},
		getC: function(n, v, c) {
			BBP.pieces[n].prototype["get"+v] = function() {
				return c;
			};
		},
		getPC: function(n, v, i, i2) {
			BBP.pieces[n].prototype["get"+v] = function() {
				return this[i]-this["get"+i2]()/2;
			};
		},
		basicMotion: function(n) {
			BBP.pieces[n].prototype.update = function() {
				if(BB.isGoing()) {
					this.x+=this.xv;
					this.y+=this.yv;
					BBP.stubs.collide(this);
				}
			};
		},
		collide: function(o) {
			if(o.getX()<=0) {
				o.xv=Math.abs(o.xv);
			}
			if(o.getY()<=0) {
				o.yv=Math.abs(o.yv);
			}
			if(o.getX()+o.getWidth()>=BB.cnvs.width) {
				o.xv=-Math.abs(o.xv);
			}
			if(o.getY()+o.getHeight()>=BB.cnvs.height) {
				o.yv=-Math.abs(o.yv);
			}
			
			var c = BB.getCollision(o);
			if(c) {
				if((o.getY()+o.getHeight()/2)<c.getY()) {
					o.yv=-Math.abs(o.yv);
				}
				if((o.getY()+o.getHeight()/2)>c.getY()+c.getHeight()) {
					o.yv=Math.abs(o.yv);
				}
				if((o.getX()+o.getWidth()/2)<c.getX()) {
					o.xv=-Math.abs(o.xv);
				}
				if((o.getX()+o.getWidth()/2)>c.getX()+c.getWidth()) {
					o.xv=Math.abs(o.xv);
				}
			}
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

BBP.pieces.ball = function(j) {
	this.x = j.x;
	this.y = j.y;
	this.xv = 0;
	this.yv = 0;
	this.controls = [
		    38,
		37, 40, 39
	];
};
BBP.pieces.ball.prototype.draw = function(ctx) {
	if(!BB.isGoing()) {
		ctx.strokeStyle="black";
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.lineTo(this.x+this.xv*10, this.y+this.yv*10);
		ctx.stroke();
	}
	ctx.fillStyle="orange";
	ctx.beginPath();
	ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
	ctx.fill();
};
BBP.stubs.getC('ball', 'Width', 20);
BBP.stubs.getC('ball', 'Height', 20);
BBP.stubs.getPC('ball', 'X', 'x', 'Width');
BBP.stubs.getPC('ball', 'Y', 'y', 'Height');
BBP.pieces.ball.prototype.onkeydown = function(e) {
	var happen = true;
	if(e.keyCode == this.controls[0]) {
		this.yv=Math.max(this.yv-1,-5);
	}
	else if(e.keyCode == this.controls[1]) {
		this.xv=Math.max(this.xv-1,-5);
	}
	else if(e.keyCode == this.controls[2]) {
		this.yv=Math.min(this.yv+1,5);
	}
	else if(e.keyCode == this.controls[3]) {
		this.xv=Math.min(this.xv+1,5);
	}
	else {
		happen = false;
	}
	if(happen) {
		e.preventDefault();
	}
};
BBP.stubs.basicMotion('ball');
