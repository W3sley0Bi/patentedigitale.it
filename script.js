class Marquee {
    constructor(row, speed, reverse) {
        this.track = row.querySelector('.carousel-track');
        this.speed = speed;
        this.reverse = reverse;
        this.offset = 0;
        this.singleWidth = 0;
        this.originalHTML = this.track.innerHTML;

        this.fill();
        window.addEventListener('resize', () => this.fill());
    }

    fill() {
        const prevRatio = this.singleWidth ? this.offset / this.singleWidth : 0;

        this.track.innerHTML = this.originalHTML;
        this.singleWidth = this.track.scrollWidth;

        const copies = Math.ceil((window.innerWidth * 3) / this.singleWidth) + 1;
        for (let i = 0; i < copies; i++) {
            this.track.insertAdjacentHTML('beforeend', this.originalHTML);
        }

        this.offset = prevRatio * this.singleWidth;
        if (this.reverse && this.offset === 0) this.offset = this.singleWidth;
    }

    tick(dt) {
        if (this.reverse) {
            this.offset -= this.speed * dt;
            if (this.offset <= 0) this.offset += this.singleWidth;
        } else {
            this.offset += this.speed * dt;
            if (this.offset >= this.singleWidth) this.offset -= this.singleWidth;
        }
        this.track.style.transform = `translateX(-${this.offset}px)`;
    }
}

let marquees = [];
let last = null;

function loop(ts) {
    if (last === null) last = ts;
    const dt = Math.min((ts - last) / 1000, 0.1);
    last = ts;
    marquees.forEach(m => m.tick(dt));
    requestAnimationFrame(loop);
}

window.addEventListener('load', () => {
    marquees = [
        new Marquee(document.querySelector('.carousel-row.top'), 80, false),
        new Marquee(document.querySelector('.carousel-row.bottom'), 80, true),
    ];
    requestAnimationFrame(loop);
});
