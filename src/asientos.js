const canvas = document.getElementById("select-seats");
const ctx = canvas.getContext("2d");

const STATE_COLOR = Object.freeze({
    Available: "lime",
    Selected: "blue",
    Unavailable: "red"
})


class Seat {
    constructor(row, col, state) {
        this.row = row;
        this.col = col;
        this.state = state;  // Available, Unavailable, Selected
    }

    isAvailable() {
        return this.state !== "Unavailable";
    }

    toggleState() {
        if (this.state === "Available") {
            this.state = "Selected";
        } else if (this.state === "Selected") {
            this.state = "Available";
        }
    }
}

class Seating {
    constructor(seatData) {
        this.seatData = seatData;
        this.rows = seatData.numberOfRows;
        this.cols = seatData.numberOfColumns;
        this.seats = []  // lista conteniendo los objetos de asiento
        
        for (const seat of seatData.seats) {
            this.seats.push(new Seat(seat.row, seat.col, seat.state))
        }
    }

    seatAt(row, col) {
        let seat = this.seats[(row - 1) * this.cols + col - 1];  // assume ordered
        if (seat.row === row && seat.col === col) return seat;
        return this.seats.find(seat => seat.row === row && seat.col === col);  // if that didn't work
    }

    draw() {
        this.seats.forEach(seat => { seat.draw() });
    }
}

class SeatingRenderer {
    constructor(seating) {
        this.seating = seating;
        this.seatSize = 10;
        this.margin = 20;
    }
    
    getSeatPosition(seat) {
        const colSpacing = (canvas.width - this.margin * 2) / this.seating.cols;
        const rowSpacing = (canvas.height - this.margin * 2) / this.seating.rows;

        const x = this.margin + (seat.col - 1) * colSpacing + colSpacing / 2;
        const y = this.margin + (seat.row - 1) * rowSpacing + rowSpacing / 2;

        return { x, y };
    }

    drawSeat(seat) {
        const {x: posX, y: posY} = this.getSeatPosition(seat);

        ctx.beginPath();
        ctx.fillStyle = STATE_COLOR[seat.state];
        ctx.arc(posX, posY, this.seatSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    draw() {
        this.seating.seats.forEach(seat => this.drawSeat(seat));
    }
}

class SeatingController {
    constructor(seating, renderer) {
        this.seating = seating;
        this.renderer = renderer;
    }

    handleClick(e) {
        let seat = this.seatAt(e.offsetX, e.offsetY);
        console.log(seat);
        if (seat && seat.isAvailable()) {
            seat.toggleState();  // Si disponible, cambiar entre elegido y no elegido.
            this.renderer.draw()
        }
    }

    seatAt(x, y) {
        for (const seat of this.seating.seats) {
            const {x: seatX, y: seatY} = this.renderer.getSeatPosition(seat);

            const xMatches = x > seatX - this.renderer.seatSize && x < seatX + this.renderer.seatSize;
            const yMatches = y > seatY - this.renderer.seatSize && y < seatY + this.renderer.seatSize;

            if (xMatches && yMatches) {
                return seat;
            }
        }
        return null;
    }
}

function loadSeating(id) {
    // Lo debería buscar de la base de datos. PLACEHOLDER
    // {numberOfRows: int, numberOfColumns: int, seats:[{row: int, col: int, state: state}, ...]}
    let data = generateSeating(10, 10);
    return data;
}

function generateSeating(rows, columns) {
    let data = {}
    data.numberOfRows = rows;
    data.numberOfColumns = columns;
    data.seats = [];
    for (let i = 1; i <= rows; i++) {
        for (let j = 1; j <= columns; j++) {
            data.seats.push({
                row: i,
                col: j,
                state: Math.random() > 0.2 ? "Available" : "Unavailable"
            })
        }
    }
    return data;
}

let id = "placeholder";

let seatingData = loadSeating(id);

let seating = new Seating(seatingData);

let seatingRenderer = new SeatingRenderer(seating);
seatingRenderer.draw()

let seatingController = new SeatingController(seating, seatingRenderer)

canvas.addEventListener("click", (e) => {
    seatingController.handleClick(e);
})