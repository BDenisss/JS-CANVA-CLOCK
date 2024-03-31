import Scene from "../canvas/Scene"
import { deg2rad } from "../utils/MathUtils"
import { RotatingArc } from "../canvas/shapes/arcs"

const drawLine = (context, x, y, length, angle) => {
    context.save()
    context.beginPath()

    // offset + rotate
    context.translate(x, y)
    context.rotate(angle) // ! radian

    // draw line
    context.moveTo(-length / 2, 0)
    context.lineTo(length / 2, 0)
    context.stroke()

    context.closePath()
    context.restore()
}

export default class Scenario extends Scene {
    constructor(id) {
        super(id)

        // gradations and numbers
        this.drawGradationAndNumbers()

        // arcs
        this.arcs = []
        this.nArcs = 1
        for (let i = 0; i < this.nArcs; i++) {
            const arc_ = new RotatingArc(
                this.width / 2,
                this.height / 2,
                this.mainRadius + (i - this.nArcs / 2) * this.deltaRadius,
                i != 0 && i != this.nArcs - 1 ? deg2rad(Math.random() * 360) : 0,
                i != 0 && i != this.nArcs - 1 ? deg2rad(Math.random() * 360) : deg2rad(360)
            )
            this.arcs.push(arc_)
        }

        // debug
        this.params['line-width'] = 2
        this.params.speed = 1
        this.params.color = "#ffffff"
        if (this.debug.active) {
            this.debugFolder.add(this.params, 'line-width', 1, 10).onChange(() => this.drawUpdate())
            this.debugFolder.add(this.params, 'speed', -2, 2, .25)
            this.debugFolder.addColor(this.params, 'color')
        }
    }

    resize() {
        super.resize()

        // main dimensions
        this.mainRadius = this.width < this.height ? this.width : this.height
        this.mainRadius *= .75
        this.mainRadius *= .5
        this.deltaRadius = this.mainRadius * .075

        // shapes update
        if (!!this.arcs) {
            this.arcs.forEach((e, index) => {
                e.x = this.width / 2
                e.y = this.height / 2
                e.radius = this.mainRadius + (index - this.arcs.length / 2) * this.deltaRadius
            })
        }

        // refresh
        this.drawUpdate()
    }

    update() {
        if (!super.update()) return
        this.drawUpdate()
        this.drawClockHands() // Draw clock hands
    }

    drawUpdate() {
        this.clear()

        // style
        this.context.lineCap = 'round'
        this.context.strokeStyle = this.params.color
        this.context.lineWidth = this.params['line-width']

        // draw
        this.drawGradationAndNumbers() // Now also draws numbers
        if (!!this.arcs) {
            this.arcs.forEach(arc => {
                if (this.params["is-update"]) arc.update(this.globalContext.time.delta / 1000, this.params.speed)
                arc.draw(this.context)
            })
        }
    }

    drawGradationAndNumbers() {
        const nGradation_ = 12;
        const nSubdivisions = 5;
    

        const hourLineLength = 20; 
        const hourLineWidth = 4; 
        const minuteLineLength = 10; 
        const minuteLineWidth = 2; 
    
    // Drawing the marks for each hour
    for (let i = 0; i < nGradation_; i++) {
        const angle_ = 2 * Math.PI * i / nGradation_ - Math.PI / 2;

        // Ajustez les valeurs ici pour éloigner les chiffres des marques de l'heure
        const numbersOffset = this.deltaRadius * 3;
        const numberRadius = this.mainRadius - numbersOffset;
        const numberX = this.width / 2 + numberRadius * Math.cos(angle_);
        const numberY = this.height / 2 + numberRadius * Math.sin(angle_);

        // Dessiner les chiffres
        const fontSize = 24;
        this.context.font = `${fontSize}px Arial`;
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        this.context.fillStyle = this.params.color;
        this.context.fillText(i === 0 ? 12 : i, numberX, numberY);

        // Dessiner les traits épais pour les heures
        const hourMarkLength = 1; 
        const xEnd = this.width / 2 + (this.mainRadius - this.deltaRadius - hourMarkLength) * Math.cos(angle_);
        const yEnd = this.height / 2 + (this.mainRadius - this.deltaRadius - hourMarkLength) * Math.sin(angle_);
        this.context.lineWidth = hourLineWidth;
        this.context.beginPath();
        this.context.moveTo(numberX, numberY);
        this.context.lineTo(xEnd, yEnd);
        this.context.stroke();
    }
    
        const totalSubdivisions = nGradation_ * nSubdivisions;
        for (let i = 0; i < totalSubdivisions; i++) {
            if (i % nSubdivisions !== 0) {
                const angle_ = 2 * Math.PI * i / totalSubdivisions - Math.PI / 2;
                const innerRadius = this.mainRadius - this.deltaRadius + minuteLineLength;
                const outerRadius = this.mainRadius - this.deltaRadius;
                const innerX = this.width / 2 + innerRadius * Math.cos(angle_);
                const innerY = this.height / 2 + innerRadius * Math.sin(angle_);
                const outerX = this.width / 2 + outerRadius * Math.cos(angle_);
                const outerY = this.height / 2 + outerRadius * Math.sin(angle_);
                
                this.context.lineWidth = minuteLineWidth;
                this.context.beginPath();
                this.context.moveTo(innerX, innerY);
                this.context.lineTo(outerX, outerY);
                this.context.stroke();
            }
        }
    }


    drawClockHands() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        this.drawHand((hours % 12) / 12 * 360 - 90, this.mainRadius * 0.5, 6); // Heures
        this.drawHand(minutes / 60 * 360 - 90, this.mainRadius * 0.8, 4); // Minutes
        this.drawHand(seconds / 60 * 360 - 90, this.mainRadius * 0.9, 2); // Secondes
    }

    drawHand(angle, length, width) {
        const radian = deg2rad(angle);
        const xEnd = this.width / 2 + length * Math.cos(radian);
        const yEnd = this.height / 2 + length * Math.sin(radian);

        this.context.beginPath();
        this.context.lineWidth = width;
        this.context.moveTo(this.width / 2, this.height / 2);
        this.context.lineTo(xEnd, yEnd);
        this.context.stroke();
    }

    drawGradation() {
        const nGradation_ = 12
        for (let i = 0; i < nGradation_; i++) {
            const angle_ = 2 * Math.PI * i / nGradation_ + Math.PI / 2
            const x_ = this.width / 2 + (this.mainRadius - this.deltaRadius / 2) * Math.cos(angle_)
            const y_ = this.height / 2 + (this.mainRadius - this.deltaRadius / 2) * Math.sin(angle_)
            const length_ = this.deltaRadius * (this.nArcs - 1)
            drawLine(this.context, x_, y_, length_, angle_)
        }
    }
}