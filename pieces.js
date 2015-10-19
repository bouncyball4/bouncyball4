var BBP = {
	loadPiece: function(j) {
		var tr =  new this.pieces[j.type](j);
		tr.type = j.type;
		return tr;
	},
	pieces: {},
	stubs: {
		basicConstruct: function(n) {
			BBP.pieces[n] = function(j) {
				this.x = parseInt(j.x);
				this.y = parseInt(j.y);
			};
			BBP.pieces[n].defaults = {x:300, y:200};
		},
		basicConstructMoving: function(n, xv, yv) {
			BBP.pieces[n] = function(j) {
				this.x = parseInt(j.x);
				this.y = parseInt(j.y);
				this.w = parseInt(j.w);
				this.h = parseInt(j.h);
				this.xv = parseInt(j.xv);
				this.yv = parseInt(j.yv);
			};
			BBP.pieces[n].defaults = {x:300,y:200,w:100,h:20,xv:0,yv:0};
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
		},
		drawVelocity: function(o, ctx) {
			if(!BB.wasGoing()) {
				var x = o.getX()+o.getWidth()/2;
				var y = o.getY()+o.getHeight()/2;
				ctx.strokeStyle="black";
				ctx.setLineDash([5,5]);
				ctx.beginPath();
				ctx.moveTo(x, y);
				ctx.lineTo(x+o.xv*30, y+o.yv*30);
				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
	}
};
BBP.pieces.woodblock = function(j) {
	this.x = j.x;
	this.y = j.y;
	this.w = j.w;
	this.h = j.h;
	this.xv = j.xv?j.xv:0;
	this.yv = j.yv?j.yv:0;
};
BBP.pieces.woodblock.defaults={x:300,y:200,w:100,h:20,xv:0,yv:0};
BBP.pieces.woodblock.prototype.draw = function(ctx) {
	BBP.stubs.drawVelocity(this, ctx);
	ctx.fillStyle=this.getColor();
	ctx.fillRect(this.x, this.y, this.w, this.h);
};
BBP.pieces.woodblock.prototype.update = function() {
	if(BB.isGoing()) {
		this.x+=this.xv;
		this.y+=this.yv;
		BBP.stubs.collide(this);
	}
};
BBP.stubs.get('woodblock', 'Width', 'w');
BBP.stubs.get('woodblock', 'Height', 'h');
BBP.stubs.get('woodblock', 'X', 'x');
BBP.stubs.get('woodblock', 'Y', 'y');
BBP.stubs.getC('woodblock', 'Color', 'black');

BBP.pieces.ball = function(j) {
	this.x = parseInt(j.x);
	this.y = parseInt(j.y);
	this.xv = 0;
	this.yv = 0;
	this.id = j.id?j.id:0;
	if(this.id==0) this.controls = [38, 37, 40, 39];
	else this.controls = [87, 65, 83, 68];
};
BBP.pieces.ball.defaults = {x:300,y:200,id:0};
BBP.pieces.ball.prototype.draw = function(ctx) {
	BBP.stubs.drawVelocity(this, ctx);
	ctx.fillStyle=this.getColor();
	ctx.beginPath();
	ctx.arc(this.x, this.y, 10, 0, Math.PI*2);
	ctx.fill();
};
BBP.pieces.ball.prototype.getColor = function() {
	var c = "lime";
	if(this.id==0) c = "orange";
	return c;
};
BBP.stubs.getC('ball', 'Width', 20);
BBP.stubs.getC('ball', 'Height', 20);
BBP.stubs.getPC('ball', 'X', 'x', 'Width');
BBP.stubs.getPC('ball', 'Y', 'y', 'Height');
BBP.pieces.ball.prototype.onkeydown = function(e) {
	var happen = true;
	if(!BB.wasGoing()) {
		if(e.keyCode == this.controls[0]) {
			this.yv=Math.max(this.yv-0.5,-2.5);
		}
		else if(e.keyCode == this.controls[1]) {
			this.xv=Math.max(this.xv-0.5,-2.5);
		}
		else if(e.keyCode == this.controls[2]) {
			this.yv=Math.min(this.yv+0.5,2.5);
		}
		else if(e.keyCode == this.controls[3]) {
			this.xv=Math.min(this.xv+0.5,2.5);
		}
		else {
			happen = false;
		}
		if(happen) {
			e.preventDefault();
		}
	}
};
BBP.pieces.ball.prototype.update = function() {
	if(BB.isGoing()) {
		this.x+=this.xv;
		this.y+=this.yv;
	}
	BBP.stubs.collide(this);
	var o = BB.getCollision(this, 'collectible');
	if(o && !this.getHeld()) {
		this.held = o;
	}
	var h = this.getHeld();
	if(h) {
		h.x = this.x;
		h.y = this.y;
	}
};
BBP.pieces.ball.prototype.getHeld = function() {
	if(!this.held) return false;
	if(BB.isPresent(this.held)) {
		return this.held;
	}
	else {
		delete this.held;
		return false;
	}
};
BBP.pieces.finish = function(j) {
	this.x = j.x;
	this.y = j.y;
	this.xv = j.xv?j.xv:0;
	this.yv = j.yv?j.yv:0;
};
BBP.pieces.finish.defaults = {x:300,y:200,xv:0,yv:0};
BBP.pieces.finish.prototype.noBounce = true;
BBP.pieces.finish.prototype.update = function() {
	var o = BB.getCollision(this, 'ball');
	if(o) {
		o.x = this.getX()+this.getWidth()/2;
		o.y = this.getY()+this.getHeight()/2;
		BB.setFinished();
	}
	if(BB.isGoing()) {
		this.x+=this.xv;
		this.y+=this.yv;
		BBP.stubs.collide(this);
	}
};
BBP.pieces.finish.prototype.draw = function(ctx) {
	BBP.stubs.drawVelocity(this, ctx);
	ctx.fillStyle = this.getColor();
	ctx.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
};
BBP.stubs.getC('finish', 'Color', 'blue');
BBP.stubs.get('finish', 'X', 'x');
BBP.stubs.get('finish', 'Y', 'y');
BBP.stubs.getC('finish', 'Width', 40);
BBP.stubs.getC('finish', 'Height', 30);
BBP.pieces.arrow = function(j) {
	this.x = j.x;
	this.y = j.y;
	this.dir = j.dir;
};
BBP.pieces.arrow.defaults = {x:300,y:200,dir:0};
BBP.pieces.arrow.prototype.draw = function(ctx) {
	var rx = this.getX();
	var ry = this.getY();
	var rw = this.getWidth();
	var rh = this.getHeight();
	if(this.dir==0||this.dir==1) rw*=3/4;
	if(this.dir==2||this.dir==3) rh*=3/4;
	if(this.dir==0) rx+=this.getWidth()/4;
	if(this.dir==2) ry+=this.getHeight()/4;
	ctx.fillStyle=this.getColor();
	ctx.fillRect(rx, ry, rw, rh);
	ctx.beginPath();
	if(this.dir==0) {
		ctx.moveTo(rx, ry);
		ctx.lineTo(this.getX(),ry+rh/2);
		ctx.lineTo(rx, ry+rh);
	}
	else if(this.dir==1) {
		ctx.moveTo(rx+rw, ry);
		ctx.lineTo(rx+this.getWidth(), ry+rh/2);
		ctx.lineTo(rx+rw, ry+rh);
	}
	else if(this.dir==2) {
		ctx.moveTo(rx, ry);
		ctx.lineTo(rx+rw/2, this.getY());
		ctx.lineTo(rx+rw, ry);
	}
	else if(this.dir==3) {
		ctx.moveTo(rx, ry+rh);
		ctx.lineTo(rx+rw/2, ry+this.getHeight());
		ctx.lineTo(rx+rw, ry+rh);
	}
	ctx.closePath();
	ctx.fill();
};
BBP.pieces.arrow.prototype.getWidth = function() {
	if(this.dir==0||this.dir==1) {
		return 80;
	}
	else {
		return 20;
	}
};
BBP.pieces.arrow.prototype.getHeight = function() {
	if(this.dir==2||this.dir==3) {
		return 80;
	}
	else {
		return 20;
	}
};
BBP.stubs.get('arrow', 'X', 'x');
BBP.stubs.get('arrow', 'Y', 'y');
BBP.stubs.getC('arrow', 'Color', 'lime');
BBP.pieces.arrow.prototype.update = function() {
	var o = BB.getCollision(this, 'moving');
	if(o) {
		var xp = this.dir==0?-1:(this.dir==1?1:0);
		var yp = this.dir==2?-1:(this.dir==3?1:0);
		var m = Math.sqrt(o.xv*o.xv+o.yv*o.yv);
		o.xv = xp*m;
		o.yv = yp*m;
	}
};
BBP.stubs.basicConstruct('key');
BBP.pieces.key.prototype.draw = function(ctx) {
	ctx.strokeStyle=this.getColor();
	ctx.lineWidth = 2;
	ctx.beginPath();
	ctx.arc(this.getX()+this.getWidth()/4, this.getY()+this.getHeight()/2, this.getHeight()/2, 0, Math.PI*2);
	ctx.lineTo(this.getX()+this.getWidth()/2, this.getY()+this.getHeight()/2);
	ctx.lineTo(this.getX()+this.getWidth()*3/4, this.getY()+this.getHeight()/2);
	ctx.lineTo(this.getX()+this.getWidth()*3/4, this.getY()+this.getHeight());
	ctx.lineTo(this.getX()+this.getWidth()*3/4, this.getY()+this.getHeight()/2);
	ctx.lineTo(this.getX()+this.getWidth(), this.getY()+this.getHeight()/2);
	ctx.lineTo(this.getX()+this.getWidth(), this.getY()+this.getHeight());
	ctx.stroke();
	ctx.lineWidth = 1;
};
BBP.pieces.key.prototype.collectible = true;
BBP.stubs.get('key', 'X', 'x');
BBP.stubs.get('key', 'Y', 'y');
BBP.stubs.getC('key', 'Width', 30);
BBP.stubs.getC('key', 'Height', 15);
BBP.stubs.getC('key', 'Color', 'gray');
BBP.pieces.key.prototype.noBounce = true;
BBP.pieces.gate = function(j) {
	BBP.pieces.woodblock.call(this, j);
};
BBP.pieces.gate.defaults = BBP.pieces.woodblock.defaults;
BBP.pieces.gate.prototype = Object.create(BBP.pieces.woodblock.prototype);
BBP.pieces.gate.prototype.update = function() {
	var o = BB.getCollision(this, 'key');
	if(o) {
		BB.removePiece(o);
		BB.removePiece(this);
	}
};
BBP.pieces.gate.prototype.draw = function(ctx) {
	BBP.pieces.woodblock.prototype.draw.call(this, ctx);
	ctx.beginPath();
	var r = Math.min(this.getWidth()*0.4, this.getHeight()*0.2);
	ctx.moveTo(this.getX() + this.getWidth()/2 - r, this.getY()+this.getHeight()/2+r*2);
	var cx = this.getX() + this.getWidth()/2;
	var cy = this.getY() + this.getHeight()/2-r;
	ctx.lineTo(cx+Math.cos(Math.PI*1.4)*r, cy-Math.sin(Math.PI*1.4)*r);
	ctx.lineTo(cx+Math.cos(Math.PI*1.6)*r, cy-Math.sin(Math.PI*1.6)*r);
	ctx.lineTo(this.getX() + this.getWidth()/2 + r, this.getY()+this.getHeight()/2+r*2);
	ctx.closePath();
	ctx.fillStyle = "gray";
	ctx.fill();
	ctx.beginPath();
	ctx.arc(cx, cy, r, 0, Math.PI*2);
	ctx.fill();
};
BBP.pieces.moveblock = function(j) {
	this.controls = [73, 74, 75, 76];
	this.keys = [];
	this.x = j.x;
	this.y = j.y;
	this.w = j.w?j.w:30;
	this.h = j.h?j.h:30;
};
BBP.pieces.moveblock.defaults = {x:300,h:200,w:30,h:30};
BBP.pieces.moveblock.prototype.onkeydown = function(e) {
	this.keys[this.controls.indexOf(e.keyCode)] = true;
};
BBP.pieces.moveblock.prototype.onkeyup = function(e) {
	this.keys[this.controls.indexOf(e.keyCode)] = false;
};
BBP.pieces.moveblock.prototype.update = function() {
	if(!BB.wasGoing()) {
		var s = 1;
		var tmx = (this.keys[1]?-1:0)+(this.keys[3]?1:0);
		var tmy = (this.keys[0]?-1:0)+(this.keys[2]?1:0);
		this.x = Math.min(Math.max(0, this.x+tmx), BB.cnvs.width-this.getWidth());
		this.y = Math.min(Math.max(0, this.y+tmy), BB.cnvs.height-this.getHeight());
	}
};
BBP.pieces.moveblock.prototype.draw = function(ctx) {
	ctx.fillStyle=this.getColor();
	ctx.fillRect(this.getX(), this.getY(), this.getWidth(), this.getHeight());
};
BBP.stubs.getC('moveblock', 'Color', 'gray');
BBP.stubs.get('moveblock', 'X', 'x');
BBP.stubs.get('moveblock', 'Y', 'y');
BBP.stubs.get('moveblock', 'Width', 'w');
BBP.stubs.get('moveblock', 'Height', 'h');
BBP.pieces.filter = function(j) {
	BBP.pieces.woodblock.call(this, j);
	this.c = j.color;
};
BBP.pieces.filter.defaults = {x:300,y:200,w:100,h:20,color:'orange'};
BBP.pieces.filter.prototype = Object.create(BBP.pieces.woodblock.prototype);
BBP.pieces.filter.prototype.draw = function(ctx) {
	ctx.globalAlpha = 0.5;
	BBP.pieces.woodblock.prototype.draw.call(this, ctx);
	ctx.globalAlpha = 1;
};
BBP.pieces.filter.prototype.noBounce = function(o) {
	return (o.getColor()==this.c);
};
BBP.stubs.get('filter', 'Color', 'c');
